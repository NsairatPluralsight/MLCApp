// Please make sure the values of the blinkingCounts & blinkingInterval are the same as in the lcd-theme.css file

var blinkingCounts = 5;   // blinking counts
var blinkingInterval = 2; //seconds
var lastUpdateTime = new Date();

var LCDElement = [
  { ID: 'TicketNumber', Caption: 'Ticket EN'},
  { ID: 'CounterNameL1', Caption: 'counterL1 EN'},
  { ID: 'ServiceNameL1', Caption: 'ServiceL1 EN'},
  { ID: 'HallNameL1', Caption: 'HallL1 EN'},
  { ID: 'HallColor', Caption: 'hallColorHeader EN'},
  { ID: 'CounterNameL2', Caption: 'counterL2 EN'},
  { ID: 'CounterNameL3', Caption: 'counterL3 EN'},
  { ID: 'CounterNameL4', Caption: 'counterL4 EN'},
  { ID: 'CounterDirection', Caption: ' Direction EN'},
  { ID: 'ServiceNameL2', Caption: 'ServiceL2 EN'},
  { ID: 'ServiceNameL3', Caption: 'ServiceL3 EN'},
  { ID: 'ServiceNameL4', Caption: 'ServiceL4 EN'},
  { ID: 'SegmentNameL1', Caption: 'SegmentL1 EN'},
  { ID: 'SegmentNameL2', Caption: 'SegmentL2 EN'},
  { ID: 'SegmentNameL3', Caption: 'SegmentL3 EN'},
  { ID: 'SegmentNameL4', Caption: 'SegmentL4 EN'},
  { ID: 'HallNameL2', Caption: 'HallL2 EN'},
  { ID: 'HallNameL3', Caption: 'HallL3 EN'},
  { ID: 'HallNameL4', Caption: 'HallL4 EN'},
  { ID: 'ServingEmployeeName', Caption: 'Employee EN'},
  { ID: 'CounterNumber', Caption: 'CounterNumber EN'},
  { ID: 'CustomerName', Caption: 'customerNameHeader EN'},
  { ID: 'HallGuidingTextL1', Caption: 'guidingTextHeaderL1 EN'},
  { ID: 'HallGuidingTextL2', Caption: 'guidingTextHeaderL2 EN'},
  { ID: 'HallGuidingTextL3', Caption: 'guidingTextHeaderL3 EN'},
  { ID: 'HallGuidingTextL4', Caption: 'guidingTextHeaderL4 EN'},
];
