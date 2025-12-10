import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config";
import {
  findUserByEmail,
  registerUser,
  findUserForLogin,
} from "../models/auth_model.js";

const JWT_SECRET = process.env.JWT_SECRET || "secret-key-default";

export const handleRegister = async (req, res) => {
  const { username, email, password, role_id } = req.body;

  if (!username || !email || !password || !role_id) {
    return res
      .status(400)
      .json({
        message: "Semua field harus diisi (username, email, password, role_id)",
      });
  }

  try {
    const [existing] = await findUserByEmail(email);
    if (existing.length > 0) {
      return res.status(409).json({ message: "Email sudah terdaftar" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await registerUser(username, email, hashedPassword, role_id);

    res.status(201).json({ message: "Pendaftaran berhasil! Silakan login." });
  } catch (error) {
    console.error("Error during registration:", error);
    res
      .status(500)
      .json({
        message: "Gagal mendaftar. Terjadi kesalahan server.",
        error: error.message,
      });
  }
};

export const handleLogin = async (req, res) => {
  const { email, password, role_id } = req.body;

  if (!email || !password || !role_id) {
    return res
      .status(400)
      .json({ message: "Email, password, dan role harus diisi" });
  }

  try {
    const [rows] = await findUserForLogin(email, role_id);
    const user = rows[0];

    if (!user) {
      return res
        .status(401)
        .json({ message: "Email, password, atau role salah." });
    }

    if (!user.pass) {
      throw new Error("Password hash (user.pass) tidak ditemukan di database.");
    }

    const normalizedHash = typeof user.pass === "string"
      ? user.pass.replace(/^\$2y\$/,"$2a$")
      : "";
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, normalizedHash);
    } catch (e) {
      return res.status(401).json({ message: "Email, password, atau role salah." });
    }

    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Email, password, atau role salah." });
    }

    const tokenPayload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role_name,
    };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "1d" });

    res.json({ message: "Login berhasil", token, user: tokenPayload });
  } catch (error) {
    console.error("Error during login:", error);
    res
      .status(500)
      .json({
        message: "Login gagal. Terjadi kesalahan server.",
        error: error.message,
      });
  }
};
