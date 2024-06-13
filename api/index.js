import express from "express";
import axios from 'axios';
import dotenv from 'dotenv';
import CircularJSON from 'circular-json';
import cors from 'cors'

dotenv.config();

const corsOptions = {
       origin: '*',
       optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
     };

app.use(cors(corsOptions));

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).json({
        message: "No worry"
    });
});


app.post('/sendRequest', async (req, res) => {
    try {
        const { value, url, body, header } = req.body;
        console.log(body)

        if (!value || !url) {
            return res.status(400).json({
                message: "Please provide a URL and request type"
            });
        }

        if (value === "POST" && !body) {
            return res.status(400).json({
                message: "Please provide a body for POST requests"
            });
        }

        let headers = {
            "Content-Type": "application/json"
        };

        if (header) {
            headers["Authorization"] = `Bearer ${header}`;
        }

        console.log(headers);

        let response;
        if (value === "GET") {
            response = await axios.get(url, { headers });
        } else if (value === 'POST') {
            response = await axios.post(url, body, { headers });
        } 
        else if(value === "PUT"){
            response =await axios.put(url,body,{headers})
        }

        else if(value === "DELETE"){
            response = await axios.delete(url,{headers,data:body});
        }
        
        
        else {
            return res.status(400).json({
                message: "Unsupported request type"
            });
        }

        return res.status(200).json({ response: response.data });
    } catch (error) {
        // Log the error using CircularJSON to handle circular references
        const errorDetails = CircularJSON.stringify(error, null, 2);
        console.error(errorDetails);

        // Send a simplified error response to the client
        return res.status(500).json({
            message: error.message,
            status: error.response?.status || 500,
            error: error.response?.data || "Internal Server Error",
            config: {
                method: error.config?.method,
                url: error.config?.url,
                data: error.config?.data
            }
        });
    }
});

app.listen(port, () => {
    console.log(`Server has started on port ${port}`);
});