const mongoose = require("mongoose");
const cities = require("./bd");
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
  for (let i = 0; i < 300; i++) {
    const random1000 = Math.floor(Math.random() * 15);
    const price = Math.floor(Math.random() * 5000) + 10;
    const camp = new CampGround({
      author: '634253f52a6d7e22a6228b0e',
      location: `${ cities[random1000].city }, ${ cities[random1000].state }`,
      title: `${ sample(descriptors) } ${ sample(places) }`,
      description:
        "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Aliquid ex est suscipit eum distinctio hic excepturi asperiores ipsum mollitia, perspiciatis tempora quibusdam, aspernatur, nulla magni accusantium rerum quisquam omnis. Soluta!",
      price: price,
      geometry: {
        type: "Point",
        coordinates: [cities[random1000].longitude, cities[random1000].latitude]
      },
      images: [
        {
          url: 'https://res.cloudinary.com/douqbebwk/image/upload/v1600060601/YelpCamp/ahfnenvca4tha00h2ubt.png',
          filename: 'YelpCamp/ahfnenvca4tha00h2ubt'
        },
        {
          url: 'https://res.cloudinary.com/douqbebwk/image/upload/v1600060601/YelpCamp/ruyoaxgf72nzpi4y6cdi.png',
          filename: 'YelpCamp/ruyoaxgf72nzpi4y6cdi'
        }
      ]
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
