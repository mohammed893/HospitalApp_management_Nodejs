-- PostgreSQL database dump

-- Dumped from database version 16.3
-- Dumped by pg_dump version 16.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

-- Create the database
CREATE DATABASE project055;
\connect project055;

-- Create sequences


--
-- Name: appointments_appointment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.appointments_appointment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.appointments_appointment_id_seq OWNER TO postgres;

--
-- Name: appointments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.appointments (
    appointment_id integer DEFAULT nextval('public.appointments_appointment_id_seq'::regclass) NOT NULL,
    doctor_id integer,
    patient_id integer,
    appointment_date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    status character varying(20) NOT NULL,
    type text,
    notes text,
    slot_id integer
);

ALTER TABLE public.appointments OWNER TO postgres;


-- Sequence for doctor_id in doctors table
CREATE SEQUENCE public.doctors_doctor_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.doctors_doctor_id_seq OWNER TO postgres;

--
-- Name: doctors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doctors (
    doctor_id integer DEFAULT nextval('public.doctors_doctor_id_seq'::regclass) NOT NULL,
    firstname character varying(50),
    qualification text,
    specialization text,
    experience integer,
    email text,
    phone integer,
    working_hours jsonb
);

ALTER TABLE public.doctors OWNER TO postgres;

--
-- Name: old_time_slots_old_slot_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.old_time_slots_old_slot_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.old_time_slots_old_slot_id_seq OWNER TO postgres;

--
-- Name: old_time_slots; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.old_time_slots (
    old_slot_id integer DEFAULT nextval('public.old_time_slots_old_slot_id_seq'::regclass) NOT NULL,
    doctor_id integer,
    date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    is_available boolean,
    deletion_date date
);

ALTER TABLE public.old_time_slots OWNER TO postgres;


--
-- Name: old_time_slots_old_slot_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.patients_patient_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.patients_patient_id_seq OWNER TO postgres;


--
-- Name: patients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patients (
    firstname character varying(50) DEFAULT nextval('public.patients_patient_id_seq'::regclass) NOT NULL,
    secondname character varying(50) NOT NULL,
    nationalidnumber character varying(20) NOT NULL,
    dateofbirth date,
    gender character varying(10),
    email text,
    phonenumber character varying(15),
    address text,
    medical_history jsonb,
    patient_id integer NOT NULL
);

ALTER TABLE public.patients OWNER TO postgres;

--
-- Name: promotions_promotionid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.promotions_promotionid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.promotions_promotionid_seq OWNER TO postgres;

--
-- Name: promotions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promotions (
    promotionid integer DEFAULT nextval('public.promotions_promotionid_seq'::regclass) NOT NULL,
    staffid integer NOT NULL,
    previousdegree character varying(20),
    newdegree character varying(20),
    promotiondate date,
    previoussalary numeric(10,2),
    newsalary numeric(10,2)
);

ALTER TABLE public.promotions OWNER TO postgres;

--
-- Name: raises_raiseid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.raises_raiseid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.raises_raiseid_seq OWNER TO postgres;

--
-- Name: raises; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.raises (
    staffid integer NOT NULL,
    raiseid integer DEFAULT nextval('public.raises_raiseid_seq'::regclass) NOT NULL,
    newsalary integer,
    raise integer,
    dateofraise date DEFAULT CURRENT_DATE
);

ALTER TABLE public.raises OWNER TO postgres;

--
-- Name: requests_requestid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.requests_requestid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.requests_requestid_seq OWNER TO postgres;

--
-- Name: requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.requests (
    requestid integer DEFAULT nextval('public.requests_requestid_seq'::regclass) NOT NULL,
    staffid integer NOT NULL,
    receiver_role character varying(50) NOT NULL,
    receiver_name character varying(50),
    content text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    dateofrequest date,
    requesttype text NOT NULL
);

ALTER TABLE public.requests OWNER TO postgres;

--
-- Name: staff_staffid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.staff_staffid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.staff_staffid_seq OWNER TO postgres;

--
-- Name: staff; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff (
    staffid integer DEFAULT nextval('public.staff_staffid_seq'::regclass) NOT NULL,
    firstname character varying(100) NOT NULL,
    lastname character varying(100) NOT NULL,
    gender character(1),
    email text,
    phone_number character varying(15),
    address text,
    nationalidnumber character varying(20),
    jobtitle character varying(50),
    department character varying(20),
    dateofhire date,
    dateofbirth date,
    salary numeric(10,0),
    managerid integer,
    employment_status character varying(50)
);

ALTER TABLE public.staff OWNER TO postgres;

--
-- Name: time_slots_slotid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.time_slots_slotid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.time_slots_slotid_seq OWNER TO postgres;

--
-- Name: time_slots; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.time_slots (
    slot_id integer DEFAULT nextval('public.time_slots_slotid_seq'::regclass) NOT NULL,
    doctor_id integer,
    date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    is_available boolean DEFAULT true,
    available_days jsonb
);

ALTER TABLE public.time_slots OWNER TO postgres;

--
-- Name: vacations_vacationid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vacations_vacationid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.vacations_vacationid_seq OWNER TO postgres;

--
-- Name: vacations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vacations (
    vacationid integer DEFAULT nextval('public.vacations_vacationid_seq'::regclass) NOT NULL,
    staffid integer,
    startdate date,
    enddate date,
    duration integer,
    typeofvacation character varying(20)
);

ALTER TABLE public.vacations OWNER TO postgres;

--
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.appointments (appointment_id, doctor_id, patient_id, appointment_date, start_time, end_time, status, type, notes, slot_id) FROM stdin;
\.

--
-- Data for Name: doctors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.doctors (doctor_id, firstname, qualification, specialization, experience, email, phone, working_hours) FROM stdin;
\.

--
-- Data for Name: old_time_slots; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.old_time_slots (old_slot_id, doctor_id, date, start_time, end_time, is_available, deletion_date) FROM stdin;
\.

--
-- Data for Name: patients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.patients (firstname, secondname, nationalidnumber, dateofbirth, gender, email, phonenumber, address, medical_history, patient_id) FROM stdin;
\.

--
-- Data for Name: promotions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotions (promotionid, staffid, previousdegree, newdegree, promotiondate, previoussalary, newsalary) FROM stdin;
\.

--
-- Data for Name: raises; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.raises (staffid, raiseid, newsalary, raise, dateofraise) FROM stdin;
\.

--
-- Data for Name: requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.requests (requestid, staffid, receiver_role, receiver_name, content, status, dateofrequest, requesttype) FROM stdin;
\.

--
-- Data for Name: staff; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.staff (staffid, firstname, lastname, gender, email, phone_number, address, nationalidnumber, jobtitle, department, dateofhire, dateofbirth, salary, managerid, employment_status) FROM stdin;
\.

--
-- Data for Name: time_slots; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.time_slots (slot_id, doctor_id, date, start_time, end_time, is_available, available_days) FROM stdin;
\.

--
-- Data for Name: vacations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vacations (vacationid, staffid, startdate, enddate, duration, typeofvacation) FROM stdin;
\.

--
-- Name: old_time_slots_old_slot_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.old_time_slots_old_slot_id_seq', 1, false);

--
-- Name: promotions_promotionid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.promotions_promotionid_seq', 1, false);

--
-- Name: raises_raiseid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.raises_raiseid_seq', 1, false);

--
-- Name: requests_requestid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.requests_requestid_seq', 1, false);

--
-- Name: staff_staffid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.staff_staffid_seq', 1, false);

--
-- Name: time_slots_slotid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.time_slots_slotid_seq', 1, false);

--
-- Name: vacations_vacationid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vacations_vacationid_seq', 1, false);

--
-- Name: appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--


ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (appointment_id);

--
-- Name: doctors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_pkey PRIMARY KEY (doctor_id);

--
-- Name: old_time_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.old_time_slots
    ADD CONSTRAINT old_time_slots_pkey PRIMARY KEY (old_slot_id);

--
-- Name: patients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (patient_id);

--
-- Name: promotions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT promotions_pkey PRIMARY KEY (promotionid);

--
-- Name: raises_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.raises
    ADD CONSTRAINT raises_pkey PRIMARY KEY (raiseid);

--
-- Name: requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.requests
    ADD CONSTRAINT requests_pkey PRIMARY KEY (requestid);

--
-- Name: staff_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_pkey PRIMARY KEY (staffid);

--
-- Name: time_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.time_slots
    ADD CONSTRAINT time_slots_pkey PRIMARY KEY (slot_id);

--
-- Name: vacations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vacations
    ADD CONSTRAINT vacations_pkey PRIMARY KEY (vacationid);

--
-- Name: appointments_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(appointment_id);

--
-- Name: appointments_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(doctor_id);

--
-- Name: appointments_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id);

--
-- Name: appointments_slot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_slot_id_fkey FOREIGN KEY (slot_id) REFERENCES public.time_slots(slot_id) ON DELETE CASCADE;

--
-- Name: raises_staffid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.raises
    ADD CONSTRAINT raises_staffid_fkey FOREIGN KEY (staffid) REFERENCES public.staff(staffid) ON DELETE CASCADE;

--
-- Name: requests_staffid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.requests
    ADD CONSTRAINT requests_staffid_fkey FOREIGN KEY (staffid) REFERENCES public.staff(staffid) ON DELETE CASCADE;

--
-- Name: staff_managerid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--
ALTER TABLE public.doctors ADD COLUMN password text;


ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_managerid_fkey FOREIGN KEY (managerid) REFERENCES public.staff(staffid) ON DELETE CASCADE;

--
-- Name: time_slots_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.time_slots
    ADD CONSTRAINT time_slots_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(doctor_id) ON DELETE CASCADE;

--
-- PostgreSQL database dump complete
--
