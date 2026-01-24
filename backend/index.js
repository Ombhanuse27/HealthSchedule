const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const { ExpressPeerServer } = require("peer");
dotenv.config({ path: "../.env" });
const hospitalRoutes = require("./Routes/hospitalRoutes");
const adminRoutes = require("./Routes/adminRoutes");
const opdRoutes = require("./Routes/opdRoutes");
const doctorRoutes = require("./Routes/doctorRoutes");
const emailRoutes = require("./Routes/emailRoutes");
const aiWebhookRoutes = require('./Routes/aiWebhookRoutes');


const app = express();

// ✅ Allow both local & deployed frontend domains
app.use(
  cors({
    origin: [
      "http://localhost:3000", // local frontend
      "https://health-scheduling.vercel.app", // deployed frontend
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// ✅ THE FIX: Increase the payload size limit
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ✅ MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Error:", err));

// ✅ API Routes
app.use("/api/admin", adminRoutes);
app.use("/api/doctors", doctorRoutes);

app.use("/api", opdRoutes);
app.use("/api/hospital", hospitalRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/ai", aiWebhookRoutes);

app.get("/", (req, res) => res.send("🏥 Hospital Queuing System Running"));


// ✅ Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)

);



// ✅ Attach PeerJS server (on same port)
const peerServer = ExpressPeerServer(server, {
  path: "/",
  allow_discovery: true,
});

// ✅ Log PeerJS connection events
peerServer.on("connection", (client) => {
  console.log("🟢 Peer connected:", client.id);
});
peerServer.on("disconnect", (client) => {
  console.log("🔴 Peer disconnected:", client.id);
});

// ✅ Mount PeerJS to backend
app.use("/peerjs", peerServer);

// Optional: Health check endpoint for Render
app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));
