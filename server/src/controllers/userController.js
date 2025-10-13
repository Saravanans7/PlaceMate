import User from '../models/User.js';
import bcrypt from 'bcrypt';
import * as XLSX from 'xlsx';

export async function getMe(req, res) {
  res.json({ success: true, data: sanitize(req.user) });
}

export async function updateMe(req, res, next) {
  try {
    const up = await User.findByIdAndUpdate(req.user._id, req.body, { new: true });
    res.json({ success: true, data: sanitize(up) });
  } catch (e) { next(e); }
}


export async function getPlacementInfo(req, res, next) {
  try {
    const user = await User.findById(req.user._id).select('isPlaced placedAt placedCompany placedCompanyName').populate('placedCompany');
    res.json({ success: true, data: user });
  } catch (e) { next(e); }
}

export async function listStudents(req, res, next) {
  try {
    const { page = 1, limit = 10, batch, search } = req.query;
    const query = { role: 'student' };

    if (batch) query.batch = Number(batch);
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const students = await User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: students,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (e) { next(e); }
}

export async function createStudent(req, res, next) {
  try {
    const studentData = { ...req.body, role: 'student' };

    // Hash password if provided
    if (studentData.password) {
      studentData.passwordHash = await bcrypt.hash(studentData.password, 10);
      delete studentData.password;
    }

    const student = await User.create(studentData);
    res.status(201).json({ success: true, data: sanitize(student) });
  } catch (e) {
    if (e.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email or username already exists' });
    }
    next(e);
  }
}

export async function getStudent(req, res, next) {
  try {
    const student = await User.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    if (student.role !== 'student') return res.status(404).json({ success: false, message: 'User is not a student' });
    res.json({ success: true, data: sanitize(student) });
  } catch (e) { next(e); }
}

export async function updateStudent(req, res, next) {
  try {
    const student = await User.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    if (student.role !== 'student') return res.status(404).json({ success: false, message: 'User is not a student' });

    const updateData = { ...req.body };

    // Hash password if provided
    if (updateData.password) {
      updateData.passwordHash = await bcrypt.hash(updateData.password, 10);
      delete updateData.password;
    } else {
      delete updateData.password; // Don't update password if not provided
    }

    const updatedStudent = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json({ success: true, data: sanitize(updatedStudent) });
  } catch (e) {
    if (e.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email or username already exists' });
    }
    next(e);
  }
}

export async function deleteStudent(req, res, next) {
  try {
    const student = await User.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    if (student.role !== 'student') return res.status(404).json({ success: false, message: 'User is not a student' });

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (e) { next(e); }
}

export async function bulkCreateStudents(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Excel file is required' });
    }

    // Read Excel file
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    if (jsonData.length === 0) {
      return res.status(400).json({ success: false, message: 'Excel file is empty' });
    }

    const students = [];
    const errors = [];
    const duplicates = [];

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      const rowNumber = i + 2; // Excel rows start from 1, and header is row 1

      try {
        // Validate required fields
        if (!row.name || !row.email) {
          errors.push({ row: rowNumber, message: 'Name and email are required' });
          continue;
        }

        // Check for existing user
        const existingUser = await User.findOne({
          $or: [
            { email: row.email.toLowerCase() },
            { rollNumber: row.rollNumber }
          ]
        });

        if (existingUser) {
          duplicates.push({
            row: rowNumber,
            name: row.name,
            email: row.email,
            reason: existingUser.email === row.email.toLowerCase() ? 'Email already exists' : 'Roll number already exists'
          });
          continue;
        }

        // Prepare student data
        const studentData = {
          name: row.name,
          email: row.email.toLowerCase(),
          role: 'student',
          rollNumber: row.rollNumber || undefined,
          batch: row.batch ? Number(row.batch) : undefined,
          cgpa: row.cgpa ? Number(row.cgpa) : undefined,
          arrears: row.arrears ? Number(row.arrears) : 0,
          historyOfArrears: row.historyOfArrears ? Number(row.historyOfArrears) : 0,
          tenthPercent: row.tenthPercent ? Number(row.tenthPercent) : undefined,
          twelfthPercent: row.twelfthPercent ? Number(row.twelfthPercent) : undefined,
          phone: row.phone || undefined,
          nativePlace: row.nativePlace || undefined
        };

        // Hash password (use a default password if not provided)
        const defaultPassword = String(row.password || 'password123');
        studentData.passwordHash = await bcrypt.hash(defaultPassword, 10);

        students.push(studentData);
      } catch (error) {
        errors.push({ row: rowNumber, message: error.message });
      }
    }

    // Create students in batch
    const createdStudents = [];
    if (students.length > 0) {
      try {
        const result = await User.insertMany(students);
        createdStudents.push(...result.map(student => sanitize(student)));
      } catch (bulkError) {
        console.error('Bulk insert error:', bulkError);
        return res.status(500).json({
          success: false,
          message: 'Error creating students',
          details: bulkError.message
        });
      }
    }

    res.json({
      success: true,
      data: {
        created: createdStudents.length,
        errors: errors.length,
        duplicates: duplicates.length,
        students: createdStudents
      },
      errors,
      duplicates
    });
  } catch (e) {
    console.error('Bulk upload error:', e);
    next(e);
  }
}

function sanitize(user) {
  const u = user.toObject();
  delete u.passwordHash;
  delete u.__v;
  return u;
}


