// server/models/Snapshot.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PointSchema = new Schema({
  lat: { type: Number },
  lon: { type: Number },
  ts: { type: Number }
}, { _id: false });

const SnapshotSchema = new Schema({
  userId: { type: String, default: null },
  startedAt: { type: Date },
  stoppedAt: { type: Date },
  distanceMeters: { type: Number },
  durationSec: { type: Number },
  avgSpeed: { type: Number },
  mode: { type: String },
  kgCO2: { type: Number },
  cost: { type: Number },
  points: [PointSchema],
}, { timestamps: true });

module.exports = mongoose.model("Snapshot", SnapshotSchema);
