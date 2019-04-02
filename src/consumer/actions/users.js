export const update = (data) => {
  return {
    type: 'setUsers',
    manager: data.users,
  };
};

export const me = (clientName) => {
  return {
    type: 'setClientName',
    clientName,
  };
};

export const reset = () => {
  return {
    type: 'resetUsers',
  };
};
