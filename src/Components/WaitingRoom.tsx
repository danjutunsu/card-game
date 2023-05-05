import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WaitingRoom = () => {
  const [users, setUsers] = useState([]);
  const [allUsersReady, setAllUsersReady] = useState(false);

  return (
    <div>
      <h1>Waiting for Players to answer</h1>
    </div>
  );
};

export default WaitingRoom;
