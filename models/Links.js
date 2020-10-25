const { model, Schema } = require("mongoose");
const config = require("config");

const linksSchema = new Schema({
  from: { type: String, require: true },
  sessionId: { type: String, require: true },
  to: { type: String, require: true },
  code: { type: String, require: true },
  date: { type: Date, default: Date.now },
});

// удалять записи спустя expireAfterSeconds
linksSchema.index(
  { date: 1 },
  { expireAfterSeconds: config.get("timeLiveLink") }
);
module.exports = model("Links", linksSchema);
