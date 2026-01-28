import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Find your perfect stay with HomelyStay</h1>
        <p>
          Discover unique homes, apartments, and rooms hosted by local experts around the
          world.
        </p>
        <div className="hero-actions">
          <Link to="/properties" className="btn">
            Browse Properties
          </Link>
          <Link to="/register" className="btn btn-outline">
            Get Started
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Home;

