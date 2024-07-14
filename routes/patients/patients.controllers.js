const { pool } = require('../../configs/DataBase_conf');

// CREATE operation
async function createPatient(req, res) {
    const { firstname, secondname, nationalidnumber, dateofbirth, gender, email, phonenumber, address, medical_history } = req.body;
    
    // Basic validation
    if (firstname.length > 100 || secondname.length > 100 || nationalidnumber.length > 100 || email.length > 100 || phonenumber.length > 100 || address.length > 100) {
        return res.status(400).send('One or more fields exceed the maximum length of 100 characters');
    }

    const query = 'INSERT INTO public.patients (firstname, secondname, nationalidnumber, dateofbirth, gender, email, phonenumber, address, medical_history) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *';
    const values = [firstname, secondname, nationalidnumber, dateofbirth, gender, email, phonenumber, address, medical_history];
    
    try {
        const result = await pool.query(query, values);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error creating patient:', error);
        res.status(500).send('Server Error');
    }
}

// READ operation
async function getPatients(req, res) {
    const query = 'SELECT * FROM public.patients';
    
    try {
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error getting patients:', error);
        res.status(500).send('Server Error');
    }
}

async function getPatientById(req, res) {
    const { id } = req.params;
    const query = 'SELECT * FROM public.patients WHERE patient_id = $1';
    
    try {
        const result = await pool.query(query, [id]);
        if (result.rows.length === 0) {
            res.status(404).send('Patient not found');
        } else {
            res.json(result.rows[0]);
        }
    } catch (error) {
        console.error(`Error getting patient with ID ${id}:`, error);
        res.status(500).send('Server Error');
    }
}

// UPDATE operation
async function updatePatient(req, res) {
    const { id } = req.params;
    const updates = req.body;
    
    const fields = [];
    const values = [];
    let query = 'UPDATE public.patients SET ';
    
    // Construct SET clause dynamically
    Object.keys(updates).forEach((field, index) => {
        fields.push(`${field} = $${index + 1}`);
        values.push(updates[field]);
    });
    
    // Add WHERE clause for the specific patient_id
    query += fields.join(', ');
    query += ` WHERE patient_id = $${values.length + 1} RETURNING *`;
    values.push(id);
    
    try {
        const result = await pool.query(query, values);
        if (result.rows.length === 0) {
            res.status(404).send('Patient not found');
        } else {
            res.json(result.rows[0]);
        }
    } catch (error) {
        console.error(`Error updating patient with ID ${id}:`, error);
        res.status(500).send('Server Error');
    }
}

// DELETE operation
async function deletePatient(req, res) {
    const { id } = req.params;
    const query = 'DELETE FROM public.patients WHERE patient_id = $1 RETURNING *';
    
    try {
        const result = await pool.query(query, [id]);
        if (result.rows.length === 0) {
            res.status(404).send('Patient not found');
        } else {
            res.send('Patient deleted successfully');
        }
    } catch (error) {
        console.error(`Error deleting patient with ID ${id}:`, error);
        res.status(500).send('Server Error');
    }
}
async function getAppointmentsByPatientId(req, res) {
    const { id } = req.params;
    const query = 'SELECT * FROM public.appointments WHERE patient_id = $1';
    
    try {
        const result = await pool.query(query, [id]);
        if (result.rows.length === 0) {
            res.status(404).send('No appointments found for this patient');
        } else {
            res.json(result.rows);
        }
    } catch (error) {
        console.error(`Error getting appointments for patient with ID ${id}:`, error);
        res.status(500).send('Server Error');
    }
}
const SECRET_KEY = 'your_secret_key'; // Change this to your secret key

// Patient Signup
async function signupPatient(req, res) {
    const { firstname, secondname, nationalidnumber, dateofbirth, gender, email, phonenumber, address, medical_history, password } = req.body;

    // Basic validation
    if (firstname.length > 100 || secondname.length > 100 || nationalidnumber.length > 100 || email.length > 100 || phonenumber.length > 100 || address.length > 100) {
        return res.status(400).send('One or more fields exceed the maximum length of 100 characters');
    }

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = 'INSERT INTO public.patients (firstname, secondname, nationalidnumber, dateofbirth, gender, email, phonenumber, address, medical_history, password) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *';
        const values = [firstname, secondname, nationalidnumber, dateofbirth, gender, email, phonenumber, address, medical_history, hashedPassword];

        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error signing up patient:', error);
        res.status(500).send('Server Error');
    }
}

// Patient Login
async function loginPatient(req, res) {
    const { email, password } = req.body;

    try {
        const query = 'SELECT * FROM public.patients WHERE email = $1';
        const result = await pool.query(query, [email]);

        if (result.rows.length === 0) {
            return res.status(400).send('Invalid email or password');
        }

        const patient = result.rows[0];
        const validPassword = await bcrypt.compare(password, patient.password);

        if (!validPassword) {
            return res.status(400).send('Invalid email or password');
        }

        const token = jwt.sign({ patient_id: patient.patient_id }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        console.error('Error logging in patient:', error);
        res.status(500).send('Server Error');
    }
}


module.exports = {
    createPatient,
    getPatients,
    getPatientById,
    updatePatient,
    deletePatient,
    getAppointmentsByPatientId,
    signupPatient,
    loginPatient
};
