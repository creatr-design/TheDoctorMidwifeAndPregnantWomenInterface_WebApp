--
-- PostgreSQL database dump
--

-- Dumped from database version 16.3
-- Dumped by pg_dump version 16.3

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

--
-- Name: appointments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.appointments (
    appointmentid integer NOT NULL,
    patientid integer,
    midwifeid integer,
    appointmentdate timestamp without time zone NOT NULL,
    status character varying(50),
    notes text
);


ALTER TABLE public.appointments OWNER TO postgres;

--
-- Name: appointments_appointmentid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.appointments_appointmentid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.appointments_appointmentid_seq OWNER TO postgres;

--
-- Name: appointments_appointmentid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.appointments_appointmentid_seq OWNED BY public.appointments.appointmentid;


--
-- Name: midwives; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.midwives (
    midwifeid integer NOT NULL,
    firstname character varying(50) NOT NULL,
    lastname character varying(50) NOT NULL,
    username character varying(50) NOT NULL,
    midwifepassword character varying(100) NOT NULL,
    midwifephone character varying(15) NOT NULL
);


ALTER TABLE public.midwives OWNER TO postgres;

--
-- Name: midwives_midwifeid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.midwives_midwifeid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.midwives_midwifeid_seq OWNER TO postgres;

--
-- Name: midwives_midwifeid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.midwives_midwifeid_seq OWNED BY public.midwives.midwifeid;


--
-- Name: patients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patients (
    patientid integer NOT NULL,
    patientname character varying(100) NOT NULL,
    patientphone character varying(15) NOT NULL,
    midwifeid integer,
    language character varying(10) NOT NULL,
    medical_history text,
    pregnancy_start_date date,
    sms_type character varying(5)
);


ALTER TABLE public.patients OWNER TO postgres;

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

--
-- Name: patients_patientid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.patients_patientid_seq OWNED BY public.patients.patientid;


--
-- Name: appointments appointmentid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments ALTER COLUMN appointmentid SET DEFAULT nextval('public.appointments_appointmentid_seq'::regclass);


--
-- Name: midwives midwifeid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.midwives ALTER COLUMN midwifeid SET DEFAULT nextval('public.midwives_midwifeid_seq'::regclass);


--
-- Name: patients patientid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients ALTER COLUMN patientid SET DEFAULT nextval('public.patients_patientid_seq'::regclass);


--
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.appointments (appointmentid, patientid, midwifeid, appointmentdate, status, notes) FROM stdin;
1	1	1	2024-07-11 10:00:00	Scheduled	Initial checkup
2	2	2	2024-07-12 11:00:00	Scheduled	Follow-up visit
4	4	4	2024-07-14 13:00:00	Scheduled	Blood test
6	6	1	2024-07-16 15:00:00	Scheduled	Glucose screening
7	7	2	2024-07-17 16:00:00	Scheduled	Anomaly scan
8	8	3	2024-07-18 17:00:00	Scheduled	Blood pressure check
9	9	4	2024-07-19 18:00:00	Scheduled	Diabetes screening
10	10	5	2024-07-10 09:00:00	Scheduled	Final checkup
11	1	1	2024-07-20 10:00:00	Scheduled	Initial checkup
12	2	2	2024-07-21 11:00:00	Scheduled	Follow-up visit
13	3	3	2024-07-22 12:00:00	Scheduled	Routine checkup
14	4	4	2024-07-23 13:00:00	Scheduled	Blood test
16	6	1	2024-07-25 15:00:00	Scheduled	Glucose screening
17	7	2	2024-07-26 16:00:00	Scheduled	Anomaly scan
18	8	3	2024-07-27 17:00:00	Scheduled	Blood pressure check
19	9	4	2024-07-28 18:00:00	Scheduled	Diabetes screening
21	3	5	2024-08-12 13:35:00	\N	\N
20	10	5	2024-07-29 09:00:00	Rescheduled	Final checkup
22	3	4	2024-07-24 18:08:00	\N	Reappointment
23	3	5	2024-07-26 19:25:00	\N	Needs radiotherapy
24	5	5	2024-07-26 19:25:00	\N	Try and see
25	5	5	2024-07-26 19:25:00	\N	Try and see
15	5	5	2024-07-31 12:03:00	Scheduled	Ultrasound
26	3	5	2024-07-31 06:30:00	scheduled	First visit
27	5	5	2024-08-01 07:00:00	scheduled	Follow-up visit
28	10	5	2024-08-01 18:00:00	confirmed	Routine check-up
29	3	5	2024-08-02 09:00:00	scheduled	Monthly check-up
30	5	5	2024-08-02 16:30:00	confirmed	Follow-up after treatment
35	3	5	2024-08-05 12:00:00	scheduled	Pregnancy check-up
3	3	3	2024-07-13 12:00:00	Notified	Routine checkup
5	5	5	2024-08-12 15:30:00	Scheduled	Ultrasound
32	3	5	2024-08-03 19:00:00	Notified	Routine check-up rescheduled
31	10	5	2024-08-03 13:00:00	Notified	Consultation
34	10	5	2024-08-04 17:30:00	Notified	Post-surgery follow-up
33	5	5	2024-08-04 06:45:00	Notified	Initial consultation
\.


--
-- Data for Name: midwives; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.midwives (midwifeid, firstname, lastname, username, midwifepassword, midwifephone) FROM stdin;
3	Olivia	Clark	oclark	password123	0202909236
4	Paula	Davis	pdavis	password123	0243687247
5	Quinn	Evans	qevans	password123	0243687247
1	Mary	Adams	madams	password123	0243687247
2	Nina	Brown	nbrown	password123	0243687247
\.


--
-- Data for Name: patients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.patients (patientid, patientname, patientphone, midwifeid, language, medical_history, pregnancy_start_date, sms_type) FROM stdin;
1	Alice Johnson	123-456-7890	1	Ga	\N	2024-01-12	text
4	David Brown	444-555-6666	4	Twi	\N	2024-01-12	text
6	Frank White	333-444-5555	1	Ga	\N	2024-01-12	text
7	Grace Black	666-777-8888	2	Ewe	\N	2024-01-12	text
8	Henry Silver	777-888-9999	3	English	\N	2024-01-12	text
11	Bruce	0202909236	3	Ga	\N	2024-01-12	text
12	Dexter	0244685699	3	English	\N	2024-01-12	text
9	Isla Gold	888-999-0000	4	Twi	\N	2024-01-12	text
2	Bob Smith	987-654-3210	2	Ewe	\N	2024-01-12	text
3	Cathy Lee	0202909236	3	English	No issues	2024-01-12	text
10	Jack Blue	0597936841	5	Hausa	No issues	2024-01-12	text
5	Eva Green	0243687247	5	Hausa	No issues	2024-01-12	voice
\.


--
-- Name: appointments_appointmentid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.appointments_appointmentid_seq', 35, true);


--
-- Name: midwives_midwifeid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.midwives_midwifeid_seq', 5, true);


--
-- Name: patients_patientid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.patients_patientid_seq', 12, true);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (appointmentid);


--
-- Name: midwives midwives_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.midwives
    ADD CONSTRAINT midwives_pkey PRIMARY KEY (midwifeid);


--
-- Name: midwives midwives_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.midwives
    ADD CONSTRAINT midwives_username_key UNIQUE (username);


--
-- Name: patients patients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (patientid);


--
-- Name: appointments appointments_midwifeid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_midwifeid_fkey FOREIGN KEY (midwifeid) REFERENCES public.midwives(midwifeid);


--
-- Name: appointments appointments_patientid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_patientid_fkey FOREIGN KEY (patientid) REFERENCES public.patients(patientid);


--
-- Name: patients patients_midwifeid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_midwifeid_fkey FOREIGN KEY (midwifeid) REFERENCES public.midwives(midwifeid);


--
-- PostgreSQL database dump complete
--

