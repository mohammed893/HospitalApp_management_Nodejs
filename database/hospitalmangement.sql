--
-- PostgreSQL database dump
--

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

--
-- Name: hospitalmangement; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE hospitalmangement WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'English_United States.1252';


ALTER DATABASE hospitalmangement OWNER TO postgres;

\connect hospitalmangement

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

--
-- Name: patients_patientid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.patients_patientid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.patients_patientid_seq OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: patients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patients (
    patientid integer DEFAULT nextval('public.patients_patientid_seq'::regclass) NOT NULL,
    firstname character varying(50) NOT NULL,
    lastname character varying(50) NOT NULL,
    nationalidnumber character varying(20),
    dateofbirth date,
    gender character varying(10),
    email text,
    phonenumber character varying(15),
    address text
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
-- Name: staff; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff (
    staffid integer NOT NULL,
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
-- Name: staff_staffid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.staff_staffid_seq OWNED BY public.staff.staffid;


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
-- Name: staff staffid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff ALTER COLUMN staffid SET DEFAULT nextval('public.staff_staffid_seq'::regclass);


--
-- Name: patients patients_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_email_key UNIQUE (email);


--
-- Name: patients patients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (patientid);


--
-- Name: promotions promotions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT promotions_pkey PRIMARY KEY (promotionid);


--
-- Name: raises raises_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.raises
    ADD CONSTRAINT raises_pkey PRIMARY KEY (raiseid);


--
-- Name: requests requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.requests
    ADD CONSTRAINT requests_pkey PRIMARY KEY (requestid);


--
-- Name: staff staff_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_email_key UNIQUE (email);


--
-- Name: staff staff_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_pkey PRIMARY KEY (staffid);


--
-- Name: vacations vacations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vacations
    ADD CONSTRAINT vacations_pkey PRIMARY KEY (vacationid);


--
-- Name: promotions promotions_staffid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT promotions_staffid_fkey FOREIGN KEY (staffid) REFERENCES public.staff(staffid) ON DELETE CASCADE;


--
-- Name: raises raises_staffid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.raises
    ADD CONSTRAINT raises_staffid_fkey FOREIGN KEY (staffid) REFERENCES public.staff(staffid) ON DELETE CASCADE;


--
-- Name: requests requests_staffid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.requests
    ADD CONSTRAINT requests_staffid_fkey FOREIGN KEY (staffid) REFERENCES public.staff(staffid) ON DELETE CASCADE;


--
-- Name: staff staff_managerid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_managerid_fkey FOREIGN KEY (managerid) REFERENCES public.staff(staffid);


--
-- Name: vacations vacations_staffid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vacations
    ADD CONSTRAINT vacations_staffid_fkey FOREIGN KEY (staffid) REFERENCES public.staff(staffid) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

