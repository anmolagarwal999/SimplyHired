# SimplyHired 
SimplyHired is a job portal webapp designed by me while picking up basics of using the **MERN stack**.
It has the basic features that every job application portal should have (details below) and a very minimalistic frontend.
<hr/>

# **Business requirements**

- The product is a job portal website which must serve as a platform of job seekers and hiring managers to meet and to facilitate job hunting.
- Employers can post job requirements for a position to be filled and a prospective employee can locate and fill out a job application or submit resumes for the advertised position.

# **Functional Requirements**

- The portal has **2 types of users**: applicants and recruiters.
- There is a **registration page** for both types of users (with fields specific to the user type).
- There must be a **common login page** which redirects to the appropriate UI based on whether the user is an applicant or a recruiter.
<hr/>

### **Recruiter specific**

- The recruiter has access to the following pages: ‘Edit Profile’, ‘Add a listing’ , ‘My listings’, ‘My employees’ and ‘Applications received for a particular listing’.
- To **add a new listing** to the database, a recruiter must fill out fields like ‘job title’,‘job type’,’last date and time for application submission’, ‘salary’, ‘maximum number of acceptable applications’ and ‘number of positions available for that particular listing’.
- The recruiter also has the option to **edit fields** like ‘deadline time’, ‘maximum number of applications accepted’ and ‘number of positions present’ for a particular listing. He/she may also be able to delete a listing. This functionality is present on the ‘MY LISTINGS’ page where all *undeleted and incompletely filled jobs* posted by the recruiter are visible.
- If all the positions for a particular job are filled, then all the remaining applications for that particular job will be rejected *(an email is sent out to them in such a case)*.
- The recruiter must be able to **rate an applicant** (whose application he has already accepted). This feature must be present on the ‘MY EMPLOYEES”’ page.
- The recruiter is allowed to set the maximum number of slots available more than maximum number of acceptable applications as it makes sense that even if there are 10 positions, the recruiter might want to allow application submission in several iterations of let's say 4 applications.

### Applicant specific

- The applicant has access to the following pages: ‘Edit profile page’, ‘My Applications Page’, ‘Currently active listings page’ and ‘Submit SOP for a particular listing’ page.
- The applicant is able to **view all active jobs** (undeleted jobs whose deadline for application submission has not yet expired). An applicant can apply for a job by filling out his/her **SOP** for the job.
- An application can have **4 statuses: applied, accepted, rejected and shortlisted**. All applications except rejected ones are considered active.
- An applicant can have **at most 10 open applications** and can apply for a job only if he/she has not been hired by any other recruiter yet.
- If an applicant is hired, all his other pending applications are automatically be rejected.
- While registering, an applicant must be able to **insert the skills** they have (only text-based input is permissible). The form must have a list (L1) of some common skills (which the user can select to add to his profile). The user also has the option of adding any additional skill (which is not already present in list L1) to his profile.
- The applicant also has the option of *uploading his/her profile image*.
- The applicant has the option of **rating a particular job** in which he was accepted. This feature is present on the ‘MY APPLICATIONS’ page for the applicant. This page will also show the current statuses of all the applications submitted by the applicant yet.
- The ‘“Currently active listings page” must allow the applicant to sort jobs based on salary, title, job duration etc. It must also allow the applicant to filter jobs based on job duration, salary expectations and job type.
- The applicant **receives an email** in case he is accepted or rejected for a particular job listing.
<hr/>

# **Non-functional requirements**

- **Performance-wise:** The product displays a good response time supported by use of efficient algorithms (like sorting entries, searching for an entry in the database etc.)
- **Extensive error handling :** The portal handles errors and notifies any potential errors like ‘networking not working’, ‘server not responding’ appropriately to the user.
- Since several users may be served by the same server, extensive checks must be present on the server side to **avoid side-effects which the front-end validation** may have missed.
- Handling concurrency related issues
- The system uses Express to create a server on the backend side.
- React has been used for designing the FrontEnd
- Node libraries are used to assist in both frontend and backend
- MogoDB Atlas is used for database storage.

A more detailed explanation of the use-cases can be found in [use_cases_description.pdf](./use_cases_description.pdf)
<hr/>

## API's
All the API's are in the ``controllers``  folder within the ``backend directory``. The API's are divided into files based on their use cases.

## Database Schemas
All the MongoDB schemas are in the ``models``` folder within the ```backend directory```. 
- ```Applicant``` - Applicant information (personal details, skills, hiring status, active applications by the applicant)
- ```Recruiter``` - Recruiter information (personal details, description of the company he/she is representing etc )
- ```Listing/Job``` - Listings are created by recruiters and tracks details like 'deadline date for application submission', 'number of vacant slots etc'
- ```Application``` - An application is submitted by an applicant for a Listing. Details like the date of submission, rating of applicant at the time of application submission, SOP content etc is stored here.

## Frontend details
The frontend was created using the React and all the components are within the ```components``` directory inside the ```./frontend/src``` directory. 
<hr/>


## Using the portal
Install required packages and then run the frontend and backend servers
```(shell)
$ cd frontend
$ npm start
$ cd ../backend
$ npm run server
```

The frontend is deployed at PORT 3000.
The backend makes requests to port 5000.
Visit `http://localhost:3000` in your browser.
