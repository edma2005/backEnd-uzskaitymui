require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const app = express();
const port = process.env.PORT || 8080;
const { URI } = process.env;

app.use(cors());
app.use(express.json());

const client = new MongoClient(URI);

app.post("/api/fill", async (req, res) => {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/users");
    const uniqueData = await response.json();

    const mapped = uniqueData.map((elem) => ({
      _id: elem.id,
      name: elem.name,
      email: elem.email,
    }));
    const mappedAddress = uniqueData.map((elem) => ({
      _id: elem.id,
      city: elem.address.city,
      street: elem.address.street,
    }));
    const con = await client.connect();
    const users = await con
      .db("BackEndLastTest")
      .collection("users_db")
      .insertMany(mapped);
    const address = await con
      .db("BackEndLastTest")
      .collection("addresses_db")
      .insertMany(mappedAddress);
    await con.close();
    res.send("Users and Addresses Added");
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const con = await client.connect();
    const data = await con
      .db("BackEndLastTest")
      .collection("users_db")
      .aggregate([
        {
          $lookup: {
            from: "addresses_db",
            localField: "_id",
            foreignField: "_id",
            as: "addresses_db",
          },
        },
      ])
      .toArray();
    res.send(data);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/api/users/names", async (req, res) => {
  try {
    const con = await client.connect();
    const data = await con.db("BackEndLastTest")
    .collection("users_db").find().toArray();
    console.log(data);
    const show = data.map((value) => {
      return {
        id: value._id,
        name: value.name,
      };
    });
    res.send(show);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/api/users/emails", async (req, res) => {
  try {
    const con = await client.connect();
    const data = await con.db("BackEndLastTest")
    .collection("users_db").find().toArray();
    res.send(data);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/api/users/address", async (req, res) => {
  try {
    const con = await client.connect();
    const data = await con
      .db("BackEndLastTest")
      .collection("users_db")
      .aggregate([
        {
          $lookup: {
            from: "addresses_db",
            localField: "_id",
            foreignField: "_id",
            as: "addresses_db",
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            addresses_db: 1,
          },
        },
      ])
      .toArray();
    res.send(data);
  } catch (error) {
    res.status(500).send(error);
  }
});

  app.listen(port, () => {
    console.log(`Server is running on Edma PC 127.0.0.1:${port}`);
  });