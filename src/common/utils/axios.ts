import axios from 'axios';

const httpRequests = {
  request: async function (configs): Promise<any> {
    return await axios(configs)
      .then((response) => {
        return response;
      })
      .catch((err) => {
        const errResp = err.response;
        if (errResp !== undefined) {
          return errResp;
        } else {
          return { status: 500, data: { message: err.message } };
        }
      });
  },
};

export const httpRequest = httpRequests;
