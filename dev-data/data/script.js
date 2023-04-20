const fs = require("fs");
const Tour = require("../../model/tourModel");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const port = 3000;
dotenv.config({ path: "./config.env" });
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log("DB Connected !!"));

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, "utf-8"));

const importData = async () => {
  try {
    await Tour.create(tours);
  } catch (err) {
    console.log("err", err);
  }
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
  } catch (err) {
    console.log("err", err);
  }
};
if (process.argv[2] === "--import") {
  importData();
  process.exit();
}
if (process.argv[2] === "--delete") {
  deleteData();
  process.exit();
}
