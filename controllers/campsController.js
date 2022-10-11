const CampGround = require("../models/camgGround");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");
``;


module.exports.index = async (req, res) => {
    const campgrounds = await CampGround.find({});
    res.render("campgrounds/index", { campgrounds });
};

/* This is a route that is rendering the new.ejs file in the campgrounds folder. */
module.exports.newForm = (req, res) => {
    res.render("campgrounds/new");
};

/* Validating the data that is being sent to the server. */
module.exports.createCamp = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    const campground = new CampGround(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
    req.flash("success", "successfully made a new camp");
    res.redirect(`/campgrounds/${ campground._id }`);
};

module.exports.showCamp = async (req, res) => {
    const campground = await CampGround.findById(req.params.id).populate({
        path: "reviews",
        populate: {
            path: 'author'
        }
    }).populate('author');
    // console.log(campground);
    if (!campground) {
        req.flash('error', 'Can not find the camp');
        return res.redirect('/campgrounds');
    }
    res.render("campgrounds/show", { campground });
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await CampGround.findById(id);

    if (!campground) {
        req.flash('error', 'Can not find the camp');
        return res.redirect('/campgrounds');
    }
    res.render("campgrounds/edit", { campground });
};

/* This is updating the campground with the new information that is being sent to the server. */
module.exports.updateCamp = async (req, res) => {
    const { id } = req.params;

    const campground = await CampGround.findByIdAndUpdate(id, {
        ...req.body.campground,
    });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);

    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }
    req.flash("success", "successfully updated the camp");
    res.redirect(`/campgrounds/${ campground._id }`);
};

module.exports.deleteCamp = async (req, res) => {
    const { id } = req.params;
    await CampGround.findByIdAndDelete(id);
    req.flash("success", "Deleted the camp");
    res.redirect("/campgrounds");
};