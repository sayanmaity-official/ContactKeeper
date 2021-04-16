const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { check, validationResult } = require("express-validator");

const User = require("../models/User");
const Contact = require("../models/Contact");

//@route    GET    api/contacts
//@desc     GET all user's contacts
//@access   PRIVATE
router.get("/", auth, async (req, res) => {
  try {
    const contacts = await Contact.find({ user: req.user.id }).sort({
      date: -1,
    });
    res.json(contacts);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

//@route    POST    api/contacts
//@desc     Add new Contact
//@access   PRIVATE
router.post(
  "/",
  [auth, [check("name", "Name is Required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).status.json({ errors: errors.array() });

    const { name, email, phone, type } = req.body;
    try {
      const newContact = new Contact({
        name,
        email,
        phone,
        type,
        user: req.user.id,
      });

      const contact = await newContact.save();
      res.json(contact);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
  }
);

//@route    PUT    api/contacts/:id
//@desc     Update user's contacts
//@access   PRIVATE
router.put("/:id", auth, async (req, res) => {
  const { name, email, phone, type } = req.body;

  //Build contact object
  const contactFields = {};
  if (name) contactFields.name = name;
  if (email) contactFields.email = email;
  if (phone) contactFields.phone = phone;
  if (type) contactFields.type = type;

  try {
    let contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ msg: "Contact Not Found" });

    //Make sure user owns contact
    if (contact.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not Authorised" });
    }

    contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { $set: contactFields },
      { new: true }
    );
  } catch (err) {
    console.error(err);
    res.status(500).send("server error");
  }
});

//@route    DELETE    api/contacts/:id
//@desc     Delete user's contacts
//@access   PRIVATE
router.delete("/:id", auth, async (req, res) => {
  try {
    let contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ msg: "Contact Not Found" });

    //Make sure user owns contact
    if (contact.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not Authorised" });
    }

    await Contact.findByIdAndRemove(req.params.id);
    res.json({ msg: "contact removed" });
  } catch (err) {
    console.error(err);
    res.status(500).send("server error");
  }
});
module.exports = router;
