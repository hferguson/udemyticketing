import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/build-client';
import Header from '../components/header';

const AppComponent =  ( {Component, pageProps, currentUser} ) => {
  return (
    <div>
      <Header currentUser={currentUser} />
      <Component {...pageProps} />
    </div>
  )
};

AppComponent.getInitialProps = async (appContext) => {
  
  const context = appContext.ctx;
  try  {
    const client = buildClient(context);
    const {data} = await client.get('/api/users/currentuser');
    let pageProps = {};
    if (appContext.Component.getInitialProps) {
        pageProps = await appContext.Component.getInitialProps(context);
    }
    

    return {
      pageProps,
      ...data
    }
  } catch (err) {
    console.error(err.message);
  }
 

  return {};
};

export default AppComponent;