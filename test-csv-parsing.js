import { parseTrainDataCSV } from '../src/lib/trainDataUpload';

// Test CSV content with the problematic row
const testCSV = `train_no,train_name,sequence,station_code,station_name,arrival_time,departure_time,distance_from_source,source_station_code,source_station_name,destination_station_code,destination_station_name
11079,LTT-GKP EXPR,18,GD,GONDA JN.,20:10:00,20:15:00,1524,LTT,LOKMANYA TILAK TERMINUS,GKP,GORAKHPUR JN.
11079,LTT-GKP EXPR,19,BLP,"BALRAMPUR,",21:02:00,21:04:00,1564,LTT,LOKMANYA TILAK TERMINUS,GKP,GORAKHPUR JN.
11079,LTT-GKP EXPR,20,JKNI,JHARKHANDI F,21:11:00,21:13:00,1567,LTT,LOKMANYA TILAK TERMINUS,GKP,GORAKHPUR JN.`;

try {
  const result = parseTrainDataCSV(testCSV);
  console.log('Parsed successfully!');
  console.log('Number of records:', result.length);
  console.log('Problematic row (BALRAMPUR):', result[1]);
} catch (error) {
  console.error('Test failed:', error);
}
