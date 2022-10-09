const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const CampGround = require("../models/camgGround");

main().catch((err) => console.log(err));
/**
 * This function connects to the MongoDB database and returns a promise that resolves when the
 * connection is established.
 */
async function main() {
  await mongoose.connect("mongodb://localhost:27017/campGo");
}

const db = mongoose.connection;
/* Checking if there is an error connecting to the database. If there is an error, it will log the
error. If there is no error, it will log that it is connected to the database. */
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
  console.log("connected to database");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await CampGround.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new CampGround({
      author: '634253f52a6d7e22a6228b0e',
      location: `${ cities[random1000].city }, ${ cities[random1000].state }`,
      title: `${ sample(descriptors) } ${ sample(places) }`,
      image: "https://source.unsplash.com/collection/483251",
      description:
        "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Aliquid ex est suscipit eum distinctio hic excepturi asperiores ipsum mollitia, perspiciatis tempora quibusdam, aspernatur, nulla magni accusantium rerum quisquam omnis. Soluta!",
      price: price,
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
