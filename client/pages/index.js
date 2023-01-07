
import buildClient from '../api/build-client';

const LandingPage = ({currentUser}) => {
  return currentUser ? <h1>You are signed in</h1> : <h1>You are not signed in</h1>
};

LandingPage.getInitialProps = async (context) => {
  console.log("Landing page");
  try {
    const client = buildClient(context);
    const {data} = await client.get('/api/users/currentuser');
    return data;
  }  catch(err) {
    console.error(err.message);
  }
  return {};
};

export default LandingPage;