import React from "react";
import { Global, css, connect, styled, Head } from "frontity";
import Switch from "@frontity/components/switch";
import Header from "./header";
import List from "./list";
import Post from "./post";
import Loading from "./loading";
import Title from "./title";
import PageError from "./page-error";
//SY20220117_5 Begin change --- Integrating Google-Analytics
import ReactGA from "react-ga";
//SY20220117_5 End change --- Integrating Google-Analytics

/**
 * Theme is the root React component of our theme. The one we will export
 * in roots.
 */
const Theme = ({ state }) => {
  //SY20220117_5 Begin change --- Integrating Google-Analytics
  ReactGA.initialize("UA-138142992-3");
  //console.log(ReactGA.initialize("UA-138142992-3", { debug: true }));
  ReactGA.pageview(state.router.link);
  //console.log(state.router.link);
  //SY20220117_5 End change --- Integrating Google-Analytics

  // Get information about the current URL.
  const data = state.source.get(state.router.link);
  const { mode } = state.theme;

  return (
    <>
      {/* Add some metatags to the <head> of the HTML. */}
      <Title />
      <Head>
        <title>{state.frontity.title}</title>
        {/* //SY20220117 Begin change --- Meta-Tags added */}
        <title>SPA View of ways4eu.wordpress.com</title>
        <meta
          name="description"
          content={
            state.frontity.description +
            " " +
            "contains lots of information on music, software-development, science and other stuff. " +
            "Some of the discussed topics are javascript, react, music, software, science. "
          }
        />
        <meta
          name="keywords"
          content="javascript, react, music, software, science"
        />
        {/* //SY20220117 End change --- Meta-Tags added */}
        <html lang="en" />
      </Head>

      {/* Add some global styles for the whole site, like body or a's. 
      Not classes here because we use CSS-in-JS. Only global HTML tags. */}
      <Global styles={globalStyles} />
      <Global
        styles={css`
          body {
            background-color: ${mode === "light" ? "#E0F8F7" : "#A1ACAF"};
            color: ${mode === "light" ? "#A1ACAF" : "#E0F8F7"};
          }
        `}
      />

      {/* Add the header of the site. */}
      <HeadContainer>
        <Header />
      </HeadContainer>

      {/* Add the main section. It renders a different component depending
      on the type of URL we are in. */}
      <Main>
        <Switch>
          <Loading when={data.isFetching} />
          <List when={data.isArchive} />
          <Post when={data.isPostType} />
          <PageError when={data.isError} />
        </Switch>
      </Main>
    </>
  );
};

export default connect(Theme);

const globalStyles = css`
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      "Droid Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
  }
  a,
  a:visited {
    color: inherit;
    text-decoration: none;
  }
`;

const HeadContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  background-color: #1f38c5;
`;

const Main = styled.div`
  display: flex;
  justify-content: center;
  background-image: linear-gradient(
    180deg,
    rgba(66, 174, 228, 0.1),
    rgba(66, 174, 228, 0)
  );
`;
