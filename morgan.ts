import morgan = require('morgan');

morgan.token('ip', function(req, res){ 
    return req.ip
});
export default morgan(':ip :method :url :status :res[content-length] - :response-time ms :date');