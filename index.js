const express=require('express');
const app=express()
const port=process.env.PORT || 1000;
const cors=require('cors');
require('dotenv').config()

app.use(cors());
app.use(express.json());

app.get('/',(req,res)=>{
    res.send('job-hunter server is running')
});

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://jobFit:e9ossQolH0mhgwVf@cluster0.kuomool.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
   
    await client.connect();
    
    const jobCollection=client.db('jobAll').collection('jobs');

    app.get('/alljob/:text',async(req,res)=>{
         if(req.params.text==='Remote' || req.params.text==="Offline"){
            const query={status:req.params.text};
            const result=await jobCollection.find(query).sort({createdAt:-1}).toArray();
            res.send(result)
         }
        //  const result=await jobCollection.find({}).toArray();
        //  res.send(result)
    })

    const indexKey={title:1,category:1};
    const indexName={name:'titleCategory'};

    const result=await jobCollection.createIndex(indexKey,indexName);

    app.get('/searchBytitle/:text',async(req,res)=>{
        const searchText=req.params.text;
        const result=await jobCollection.find({
          $or:[
            {title: {$regex: searchText, $options:'i'}},
            {category: {$regex: searchText, $options:'i'}}
          ]
        }).toArray()
        res.send(result)
    })

    app.get('/myjob/:email',async(req,res)=>{
        const user=req.params.email;
        const filter={email:req.params.email};
        const result=await jobCollection.find(filter).toArray();
        res.send(result)
    })

    app.post('/postjob',async(req,res)=>{
        const body=req.body;
        body.createdAt=new Date()
        const result=await jobCollection.insertOne(body);
        res.send(result)
    })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port,()=>{
    console.log('server is running', port)
})