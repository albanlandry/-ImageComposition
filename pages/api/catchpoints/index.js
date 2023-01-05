// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const mysql = require('mysql2/promise');
const formidable = require('formidable');

/*
mysqlConnection.connect((err)=> {
  if(!err)
      console.log('Connection Established Successfully');
  else
      console.log('Connection Failed!'+ JSON.stringify(err,undefined,2));
});

  
  mysqlConnection.query("select * from mission_info where param_name like 'm_piece%' order by mission_id", [], (err, rows, fields) => {
    if (!err) {
        // res.set({ 'content-type': 'application/json; charset=utf-8' });
        // res.send(rows);
        res.status(200).json(rows);
        // rows.forEach((element, index) => {
        //     generateQr(element, index % 6);
        // });
    }
    else
        console.log(err);
  })
  */
export const config = {
  api: {
    bodyParser: false,
  },
}

const  form = new formidable.IncomingForm({ multiples:  true }); // multiples means req.files will be an array

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
const parseFormdata = (req, res) => {
  return new Promise((resolve, reject) => {

    const  contentType = req.headers['content-type'];

    if (contentType && contentType.indexOf('multipart/form-data') !== -1) {
      form.parse(req, (err, fields, files) => {
        if (!err) {
          req.body = fields; // sets the body field in the request object
          req.files = files; // sets the files field in the request object
        }

        resolve([req, res]);
      });
    } else
      resolve([req, res]);
  });
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
const handlePost = async (req, res) => {
  const [request, response] = await parseFormdata(req, res);


  console.log('Input-data', request.body);

  try {
    const mysqlConnection = await mysql.createConnection({
      host: 'metaversero.cmpvgajxiyud.ap-northeast-2.rds.amazonaws.com',
      user: 'metaversero_adm',
      password: 'metaversero_pw1',
      database: 'metaversero',
      multipleStatements: true
    });

    const query = "select * from mission_info where param_name like 'm_piece%' order by mission_id";
    const values = [];
    const [result, encoding] = await mysqlConnection.execute(query, values);
    
    res.status(200).json(result)
  } catch(err) {
    res.status(500).json({ err: err.message });
  }
}

export default async function handler(req, res) {

  if (req.method === 'POST') { 
    await handlePost(req, res);
  }else {
    res.status(404).json(`${req.method} method is not supported for this endpoint.`);
  }
}
