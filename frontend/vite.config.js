import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        login: resolve(__dirname, "src/pages/auth/login/login.html"),
        register: resolve(__dirname, "src/pages/auth/register/register.html"),

        // Home Planner Pages 
        mineHome: resolve(
          __dirname,
          "src/pages/mine-planner/home/home_planner_page.html"
        ),
        crew: resolve(
          __dirname,
          "src/pages/mine-planner/crew/crew_management_page.html"
        ),
        pit: resolve(
          __dirname, "src/pages/mine-planner/pit/pit.html"
        ),
        targetProduction: resolve(
          __dirname,
          "src/pages/mine-planner/target_production/target_production.html"
        ),
        minePlan: resolve(
          __dirname,
          "src/pages/mine-planner/target_production/mine_plan/mining_plan.html"
        ),
        aiMiningOptimization: resolve(
          __dirname,
          "src/pages/mine-planner/ai_optimization/ai_mining_optimization.html"
        ),
        aiAgentMining: resolve(
          __dirname,
          "src/pages/mine-planner/ai_agent/ai_agent_mining.html"
        ),
        dailyAttendance: resolve(
          __dirname,
          "src/pages/mine-planner/daily-attendance/daily_attendance.html"
        ),
        dailyEquipment: resolve(
          __dirname,
          "src/pages/mine-planner/daily-equipment-status/daily_equipment-status.html"
        ),
        dailyReport: resolve(
          __dirname,
          "src/pages/mine-planner/daily-report/daily_report.html"
        ),
        employees: resolve(
          __dirname,
          "src/pages/mine-planner/employees/employees.html"
        ),
        equipment: resolve(
          __dirname,
          "src/pages/mine-planner/equipment/equipment.html"
        ),
        weeklyPeriods: resolve(
          __dirname,
          "src/pages/mine-planner/weekly-periods/weekly_periods.html"
        ),
        weeklySchedule: resolve(
          __dirname,
          "src/pages/mine-planner/weekly-schedule/weekly_schedule.html"
        ),


        // Shipping Home Pages
        shippingHome: resolve(
          __dirname,
          "src/pages/shipping-planner/home/home_shipping_page.html"
        ),
        shippingSchedule: resolve(
          __dirname,
          "src/pages/shipping-planner/shipping_schedule/shipping_schedule.html"
        ),
        shippingVessel: resolve(
          __dirname,
          "src/pages/shipping-planner/shipping_vessel/shipping_vessel.html"
        ),
        // aiAgent: resolve(
        //   __dirname,
        //   "src/pages/shipping-planner/ai_agent/ai_agent.html"
        // ),
        shipPlan: resolve(
          __dirname,
          "src/pages/shipping-planner/ai_plan/ship_plan.html"
        ),
        aiAgentShipping: resolve(
          __dirname,
          "src/pages/shipping-planner/ai_agent/ai_agent_shipping.html"
        ),
      },
    },
  },
});
