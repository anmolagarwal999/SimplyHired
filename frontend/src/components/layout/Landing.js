import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <section className='landing'>
      <div className='dark-overlay'>
        <div className='landing-inner'>
          <h1 className='x-large'>JOB PORTAL</h1>
          <p className='lead'>
            "Every new day is another chance to change your life."
          </p>
          <div className='buttons'>
            <Link to='/register' className='btn btn-dark btn-lg'>
              Register
            </Link>
            {"  "}
            <Link to='/login' className='btn btn-light btn-lg'>
              Login
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Landing;
