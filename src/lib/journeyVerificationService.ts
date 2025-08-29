import { Journey, ParcelRequest } from '@/types';
import { searchStations, getStationByCode, getStationDistance } from './stationService';

export interface JourneyMatchResult {
  isMatch: boolean;
  matchType: 'EXACT' | 'ROUTE_OVERLAP' | 'NO_MATCH';
  confidence: number; // 0-100
  details: {
    pickupStationMatch: boolean;
    dropStationMatch: boolean;
    routeInclusion: boolean;
    dateCompatibility: boolean;
    estimatedPickupTime?: string;
    estimatedDropTime?: string;
    warningMessages: string[];
    errorMessages: string[];
  };
}

export interface VerificationRequirement {
  aadhaarVerified: boolean;
  journeyVerified: boolean;
  routeMatch: boolean;
  requiredDocuments: string[];
  verificationScore: number; // 0-100
}

class JourneyVerificationService {
  /**
   * Verify if carrier's journey is compatible with parcel route
   */
  async verifyJourneyParcelMatch(
    journey: Journey, 
    parcel: ParcelRequest
  ): Promise<JourneyMatchResult> {
    try {
      const details: {
        pickupStationMatch: boolean;
        dropStationMatch: boolean;
        routeInclusion: boolean;
        dateCompatibility: boolean;
        estimatedPickupTime?: string;
        estimatedDropTime?: string;
        warningMessages: string[];
        errorMessages: string[];
      } = {
        pickupStationMatch: false,
        dropStationMatch: false,
        routeInclusion: false,
        dateCompatibility: false,
        warningMessages: [] as string[],
        errorMessages: [] as string[]
      };

      // 1. Check if journey is active and valid
      if (!journey.isActive) {
        details.errorMessages.push('Journey is not active');
        return {
          isMatch: false,
          matchType: 'NO_MATCH',
          confidence: 0,
          details
        };
      }

      // 2. Check date compatibility (journey should be on or after parcel pickup date)
      const journeyDate = new Date(journey.journeyDate);
      const parcelPickupDate = new Date(parcel.pickupTime);
      
      // Allow pickup on journey date or up to 1 day before journey
      const minAllowedDate = new Date(journeyDate);
      minAllowedDate.setDate(minAllowedDate.getDate() - 1);
      
      if (parcelPickupDate >= minAllowedDate && parcelPickupDate <= journeyDate) {
        details.dateCompatibility = true;
      } else {
        details.errorMessages.push(
          `Journey date (${journeyDate.toDateString()}) doesn't match parcel pickup date (${parcelPickupDate.toDateString()})`
        );
      }

      // 3. Check station matching
      const stationMatchResult = await this.checkStationMatching(journey, parcel);
      Object.assign(details, stationMatchResult.details);

      // 4. Calculate confidence and match type
      let confidence = 0;
      let matchType: 'EXACT' | 'ROUTE_OVERLAP' | 'NO_MATCH' = 'NO_MATCH';

      if (details.pickupStationMatch && details.dropStationMatch && details.dateCompatibility) {
        matchType = 'EXACT';
        confidence = 95;
      } else if (details.routeInclusion && details.dateCompatibility) {
        matchType = 'ROUTE_OVERLAP';
        confidence = 75;
        details.warningMessages.push('Parcel route is within your journey path but stations may not be exact stops');
      } else if (details.routeInclusion) {
        confidence = 40;
        details.warningMessages.push('Route matches but dates are incompatible');
      }

      // 5. Add time estimates if match is found
      if (matchType !== 'NO_MATCH') {
        const timeEstimates = this.estimatePickupDropTimes(journey, parcel);
        details.estimatedPickupTime = timeEstimates.pickupTime;
        details.estimatedDropTime = timeEstimates.dropTime;
      }

      return {
        isMatch: confidence >= 60, // Minimum 60% confidence required
        matchType,
        confidence,
        details
      };

    } catch (error) {
      console.error('Error verifying journey-parcel match:', error);
      return {
        isMatch: false,
        matchType: 'NO_MATCH',
        confidence: 0,
        details: {
          pickupStationMatch: false,
          dropStationMatch: false,
          routeInclusion: false,
          dateCompatibility: false,
          warningMessages: [],
          errorMessages: ['Verification service error']
        }
      };
    }
  }

  /**
   * Check if parcel stations match journey route
   */
  private async checkStationMatching(journey: Journey, parcel: ParcelRequest) {
    const details = {
      pickupStationMatch: false,
      dropStationMatch: false,
      routeInclusion: false,
      warningMessages: [] as string[],
      errorMessages: [] as string[]
    };

    try {
      // Get station codes for parcel pickup and drop locations
      const pickupStations = await searchStations(parcel.pickupStation);
      const dropStations = await searchStations(parcel.dropStation);

      const pickupStationInfo = pickupStations.find(s => 
        s.name.toLowerCase().includes(parcel.pickupStation.toLowerCase())
      );
      const dropStationInfo = dropStations.find(s => 
        s.name.toLowerCase().includes(parcel.dropStation.toLowerCase())
      );

      if (!pickupStationInfo) {
        details.errorMessages.push(`Pickup station "${parcel.pickupStation}" not found in railway network`);
        return { details };
      }

      if (!dropStationInfo) {
        details.errorMessages.push(`Drop station "${parcel.dropStation}" not found in railway network`);
        return { details };
      }

      // Check exact station matches
      const journeyStationCodes = [
        journey.sourceStationCode,
        ...journey.stations,
        journey.destinationStationCode
      ].map(code => code.toUpperCase());

      details.pickupStationMatch = journeyStationCodes.includes(pickupStationInfo.code.toUpperCase());
      details.dropStationMatch = journeyStationCodes.includes(dropStationInfo.code.toUpperCase());

      // If exact matches not found, check for nearby stations or route inclusion
      if (!details.pickupStationMatch || !details.dropStationMatch) {
        const routeAnalysis = await this.analyzeRouteInclusion(journey, pickupStationInfo, dropStationInfo);
        details.routeInclusion = routeAnalysis.isIncluded;
        
        if (routeAnalysis.warnings.length > 0) {
          details.warningMessages.push(...routeAnalysis.warnings);
        }
      } else {
        details.routeInclusion = true;
      }

      // Validate journey direction
      if (details.pickupStationMatch && details.dropStationMatch) {
        const pickupIndex = journeyStationCodes.indexOf(pickupStationInfo.code.toUpperCase());
        const dropIndex = journeyStationCodes.indexOf(dropStationInfo.code.toUpperCase());

        if (pickupIndex >= dropIndex) {
          details.errorMessages.push('Drop station comes before pickup station in your journey');
          details.routeInclusion = false;
        }
      }

    } catch (error) {
      console.error('Error checking station matching:', error);
      details.errorMessages.push('Unable to verify station compatibility');
    }

    return { details };
  }

  /**
   * Analyze if parcel route is included in journey path
   */
  private async analyzeRouteInclusion(
    journey: Journey,
    pickupStation: any,
    dropStation: any
  ): Promise<{ isIncluded: boolean; warnings: string[] }> {
    const warnings: string[] = [];
    
    try {
      // Check if stations are on the same railway line/route as journey
      const journeyDistance = await getStationDistance(
        journey.sourceStationCode,
        journey.destinationStationCode
      );

      const parcelDistance = await getStationDistance(
        pickupStation.code,
        dropStation.code
      );

      if (!journeyDistance || !parcelDistance) {
        warnings.push('Unable to calculate route distances for verification');
        return { isIncluded: false, warnings };
      }

      // Check if parcel route is geographically feasible within journey
      const sourceToPickup = await getStationDistance(
        journey.sourceStationCode,
        pickupStation.code
      );

      const pickupToDrop = await getStationDistance(
        pickupStation.code,
        dropStation.code
      );

      const dropToDestination = await getStationDistance(
        dropStation.code,
        journey.destinationStationCode
      );

      if (sourceToPickup && pickupToDrop && dropToDestination) {
        const totalCalculatedDistance = sourceToPickup + pickupToDrop + dropToDestination;
        const tolerance = journeyDistance * 0.2; // 20% tolerance

        if (Math.abs(totalCalculatedDistance - journeyDistance) <= tolerance) {
          warnings.push('Stations are on your route but may require stops at intermediate stations');
          return { isIncluded: true, warnings };
        }
      }

      warnings.push('Parcel route does not align with your journey path');
      return { isIncluded: false, warnings };

    } catch (error) {
      console.error('Error analyzing route inclusion:', error);
      warnings.push('Route analysis failed - manual verification may be required');
      return { isIncluded: false, warnings };
    }
  }

  /**
   * Estimate pickup and drop times based on journey schedule
   */
  private estimatePickupDropTimes(journey: Journey, parcel: ParcelRequest): {
    pickupTime: string;
    dropTime: string;
  } {
    // This is a basic estimation - in real implementation, you'd use train schedule APIs
    const departureTime = journey.departureTime || '06:00';
    const arrivalTime = journey.arrivalTime || '18:00';

    // Estimate based on journey duration and station positions
    const pickupTime = `Around ${departureTime} - ${this.addMinutes(departureTime, 120)}`;
    const dropTime = `Around ${this.addMinutes(departureTime, 240)} - ${arrivalTime}`;

    return { pickupTime, dropTime };
  }

  /**
   * Add minutes to time string
   */
  private addMinutes(timeStr: string, minutes: number): string {
    const [hours, mins] = timeStr.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
  }

  /**
   * Check carrier verification requirements
   */
  async checkCarrierVerificationRequirements(
    carrierUid: string,
    parcel: ParcelRequest
  ): Promise<VerificationRequirement> {
    try {
      // This would integrate with your Aadhaar verification service
      // For now, returning mock data - replace with actual verification checks
      
      const requirements: VerificationRequirement = {
        aadhaarVerified: false, // Check from database
        journeyVerified: false,
        routeMatch: false,
        requiredDocuments: [],
        verificationScore: 0
      };

      // Check Aadhaar verification status
      // const aadhaarStatus = await aadhaarService.checkVerificationStatus(carrierUid);
      // requirements.aadhaarVerified = aadhaarStatus.verified;

      // Check if carrier has valid active journey
      // const activeJourneys = await this.getCarrierActiveJourneys(carrierUid);
      // requirements.journeyVerified = activeJourneys.length > 0;

      // Calculate verification score
      let score = 0;
      if (requirements.aadhaarVerified) score += 40;
      if (requirements.journeyVerified) score += 30;
      if (requirements.routeMatch) score += 30;

      requirements.verificationScore = score;

      // Determine required documents
      if (!requirements.aadhaarVerified) {
        requirements.requiredDocuments.push('Aadhaar Verification');
      }
      if (!requirements.journeyVerified) {
        requirements.requiredDocuments.push('Valid Train Journey (PNR)');
      }
      if (parcel.weight > 5) {
        requirements.requiredDocuments.push('Additional ID for Heavy Parcel');
      }

      return requirements;

    } catch (error) {
      console.error('Error checking verification requirements:', error);
      return {
        aadhaarVerified: false,
        journeyVerified: false,
        routeMatch: false,
        requiredDocuments: ['Verification Check Failed'],
        verificationScore: 0
      };
    }
  }

  /**
   * Get matching journeys for a parcel
   */
  async findMatchingJourneys(parcel: ParcelRequest): Promise<{
    exactMatches: Journey[];
    routeMatches: Journey[];
    nearbyMatches: Journey[];
  }> {
    try {
      // This would query your database for journeys
      // Implementation depends on your database structure
      
      return {
        exactMatches: [],
        routeMatches: [],
        nearbyMatches: []
      };
    } catch (error) {
      console.error('Error finding matching journeys:', error);
      return {
        exactMatches: [],
        routeMatches: [],
        nearbyMatches: []
      };
    }
  }
}

export const journeyVerificationService = new JourneyVerificationService();
