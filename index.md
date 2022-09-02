This is the webpage for the Honours/MSc course Online Experiments for Language Scientists, running in academic year 2022/2023. I will add links to materials (readings, code) to this page; you will need to use Learn for electronic submission of your assessed work, and to keep an eye on announcements.

## Course summary

Many areas in the language sciences rely on collecting data from human participants, from grammaticality judgments to behavioural responses (key presses, mouse clicks, spoken responses). While data collection traditionally takes place face-to-face, recent years have seen an explosion in the use of online data collection: participants take part remotely, providing responses through a survey tool or custom experimental software running in their web browser, with surveys or experiments often being advertised on crowdsourcing websites like Amazon Mechanical Turk (MTurk) or Prolific. Online methods potentially allow rapid and low-effort collection of large samples (and are also useful in situations where face-to-face data collection is not possible, e.g. during a pandemic); however, building and running these experiments poses challenges that differ from lab-based methods.

This course will provide a rapid tour of online experimental methods in the language sciences, covering a range of paradigms, from survey-like responses (e.g. as required for grammaticality judgments) through more standard psycholinguistic methods (button presses, mouse clicks) up to more ambitious and challenging techniques (e.g. voice recording, real-time interaction through text and/or streaming audio, iterated learning). Each week we will read a paper detailing a study using online methods, and look at code (written in javascript using jsPsych) to implement a similar experiment - the examples will skew towards the topics I am interested in (artificial language learning, communication, language evolution), but we'll cover more standard paradigms too (grammaticality judgments, self-paced reading) and the techniques are fairly general anyway. We’ll also look at the main platforms for reaching paid participants, e.g. MTurk and Prolific, and discuss some of the challenges around data quality and the ethics of running on those platforms.

No prior experience in coding is assumed, but you have to be prepared to dive in and try things out; the assessment will involve elements of both literature review and coding.

## The teaching team

The course is co-taught by [Kenny Smith](http://www.lel.ed.ac.uk/~kenny/) and [Alisdair Tullo](https://www.ed.ac.uk/profile/alisdair-tullo/). Kenny (that's me) is the main lecturer and the course organiser; Alisdair is the PPLS javascript/jsPsych guru and delivers the lab sessions with Kenny. Best way to get in touch with us is in one of the live sessions, see below, or by email to [kenny.smith@ed.ac.uk](mailto:kenny.smith@ed.ac.uk) or [alisdair.tullo@ed.ac.uk](mailto:alisdair.tullo@ed.ac.uk).

We'll also be supported in lab classes by three excellent tutors: Aislinn Keogh, Vilde Reksnes, and Maisy Hallam. 

## Class times

The course runs in semester 1. We have lectures 10am-11am on Mondays, and lab classes 9am-11am on Wednesdays. **Timetabling for labs is currently To Be Confirmed**

Lectures and labs are both essential to doing well on the course - the assessment involves an understanding both of the literature on online experiments (covered in the readings and lectures) and the practicalities of how to build them (covered in your own work on the practicals, with support available in the labs).

### Arrangements for lectures and labs

**Information on class times and venues is currently TBC**

Lectures take place *in person* on Monday mornings, 10am-10.55am, in **room to be allocated**. Labs will take place in on Wednesday mornings, 9am-11am, in **room to be allocated**. 

Hopefully you are all familiar with attending in-person classes in covid times, but just as a reminder: 
- *Do not come to lectures if you are unwell or think you might be!* You can participate remotely (see below), so you won't miss out and you'll be protecting the rest of us. If I am isolating or unwell (but still well enough lecture) we'll do the lecture remotely; there are 5 staff members covering the labs so we should always have cover in the event that one of us is unwell.
- We encourage you to wear a mask when attending lectures and labs, particularly in contexts where it won't impede communication (e.g. when you are sitting listening to a lecture or working solo in a lab class).

If you are unable to attend in-person lectures or labs due to illness, please see the course page on Learn for instructions on how to participate remotely. Lectures will be streamed live and there is a channel for asking questions in real time. We will use Teams for remote lab attendees, and assign a tutor to monitor remote attenders. 

## Assessment

There are two pieces of assessment, due on 10th November and 8th December. Assessment 1 is an annotated bibliography reviewing and evaluating 4 articles typically drawn from the course set readings. Assessment 2 is a project where you produce a working experiment implemented in jsPsych and an accompanying report explaining the motivation behind that experiment, justifying important design decisions you took in building the experiment, and appraising the experiment and ways it could be improved/extended. Full details will be provided in assignment brief, and we will provide an FAQ. **Assignment brief and FAQ to appear**

## Course Materials

Course content will appear here as we work through the course.

Each week there will be a set reading and a programming assignment. The reading involves a blog post introducing a published paper, you read both the blog and the paper, the lecture then provides an additional brief overview and an opportunity to ask questions/discuss the reading. The programming assignment involves working through a section of the [Online Experiments with jsPsych](https://softdev.ppls.ed.ac.uk/online_experiments/index.html) tutorial and/or looking at (and editing) some code which implements a language-related experiment; you can use the lab classes as dedicated time to work on the programming task and get help with programming difficulties or questions you have.

### Week 1 (commencing 19th September): Introduction

- *Scientific content:* minimal (but I'll go over the practicalities of the course, assessments etc)
- *Technical content:* jsPsych basics
- [Reading](oels_reading_wk1.md)
- Programming task - **to appear**
- Lecture slides - **to appear**

### Week 2 (26th September): Crowdsourcing experimental data

- *Scientific content:* lab vs online data collection
- *Technical content:* more jsPsych and javascript basics

### Week 3 (3rd October): Grammaticality judgements

- *Scientific content:* lab vs online grammaticality judgments; syntactic processing and acceptability
- *Technical content:* simple key- and button-press responses

### Week 4 (10th October): Self-paced reading

- *Scientific content:* processing costs of syntactic dependencies
- *Technical content:* collecting reaction time data, more complex nested trials

### Week 5 (17th October): Lab catchup week

In week 5 there is no lecture, but we have a lab as usual - use this time to catch up on labs from previous weeks, or to catch up on / get ahead with your reading.

### Week 6 (24th October): Word learning / frequency learning

- *Scientific content:* probability matching and regularisation
- *Technical content:* using trial data for contingent trials, filtering and saving data

### Week 7 (31st October): Audio stimuli

- *Scientific content:* speech perception, social influences on phonetic adaptation
- *Technical content:* Audio, trial data again, preloading stimuli, saving data trial by trial

### Week 8 (7th November): **Topic TBC**

- *Scientific content:* TBC
- *Technical content:*  Audio recording, more randomisation stuff, custom preload lists, reading trial lists from CSV

### Week 9 (14th November): Iterated Learning

- *Scientific content:* iterated learning and the evolution of compositional structure
- *Technical content:* looping trials, reading trial lists from CSVs again, PHP scripts for iteration

### Week 10 (21st November): Participant-to-participant interaction

- *Scientific content:* least effort and Zipf's Law of Abbreviation
- *Technical content:* web sockets, python servers, incrementally building a timeline


### Week 11 (28th November): Interacting with MTurk

No lecture or lab in week 11, but there are some materials that will be useful for you to read if you are thinking of setting up a real experiment in the wild!

- *Scientific content:* None!
- *Technical content:* How to set up a server, launch and pay participants, manage qualifications, etc

### Additional drop-in labs for questions on Assessment 2 code

We will provide some extra drop-in labs to give you an opportunity to get some help with your Assignment 2 code. Obviously we won't write your code for you, but if you are having trouble interpreting an error message or finding a bug or want some tips on how to achieve a particular effect we can help you figure it out. **Dates and times TBC.**

## Re-use

All aspects of this work are licensed under a [Creative Commons Attribution 4.0 International License](http://creativecommons.org/licenses/by/4.0/).
