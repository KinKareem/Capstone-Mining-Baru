import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import equipmentRoutes from "./routes/equipment_routes.js";
import dailyReportRoutes from "./routes/daily_report_routes.js";
import weeklyPeriodsRoutes from "./routes/weekly_periods_route.js";
import employeesRoutes from "./routes/employees_route.js";
import weeklyScheduleRoutes from "./routes/weekly_schedule_route.js";
import dailyAttendanceRoutes from "./routes/daily_attendance_route.js";
import dailyEquipmentStatusRoutes from "./routes/daily_equipment_status_route.js";
import dashboardRoutes from "./routes/dashboard_route.js";
import shippingDashboardRoutes from "./routes/shipping_dashboard_route.js";
import aiRecommendationRoutes from "./routes/ai_recommendation_route.js";
import aiSummaryRoutes from "./routes/ai_summary_route.js";

const PORT = process.env.PORT || 3000;
const app = express();

const allowedEnvOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const defaultDevOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:4173",
  "http://localhost:4174",
];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (
        allowedEnvOrigins.includes(origin) ||
        defaultDevOrigins.includes(origin)
      ) {
        return cb(null, true);
      }
      return cb(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Backend API Lancar Cuyyy - Login/Register Ready");
});

app.use("/api/auth", authRoutes);

// API crew atau karyawan
app.use("/api/employees", employeesRoutes);
app.use("/employees", employeesRoutes);

// API equipment atau alat berat
app.use("/api/equipments", equipmentRoutes);

// API daily-report
app.use("/daily-reports", dailyReportRoutes);

// API weekly-periods
app.use("/api/weekly-periods", weeklyPeriodsRoutes);

// API weekly-schedules
app.use("/weekly-schedules", weeklyScheduleRoutes);
app.use("/api/weekly-schedules", weeklyScheduleRoutes);

// API daily-attendance
app.use("/daily-attendance", dailyAttendanceRoutes);

// API ai_summary
app.use("/ai_summary", aiSummaryRoutes);

app.use("/ai_recommendation", aiRecommendationRoutes);

// API daily-equipment-status
app.use("/api/daily-equipment-status", dailyEquipmentStatusRoutes);

// API blending-plan
app.use("/dashboard", dashboardRoutes);

app.use("/shipping-dashboard", shippingDashboardRoutes);

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Terjadi kesalahan pada server.";

  console.error(err.stack);

  res.status(status).json({
    message: message,
  });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
