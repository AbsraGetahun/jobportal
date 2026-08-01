import { useEffect, useState } from 'react';
import api from './api';

function testJobSeekersList() {
  const [jobSeekers, setJobSeekers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.getJobSeekers();
        setJobSeekers(response.data);
      } catch (error) {
        console.error('Error fetching job seekers:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <h2>Job Seekers</h2>
      <ul>
        {jobSeekers.map(seeker => (
          <li key={seeker.id}>
            {seeker.first_name} {seeker.last_name} - {seeker.email}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default testJobSeekersList;