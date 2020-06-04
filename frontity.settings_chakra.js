const settings = {
    name: "ways4euwp-01",
    state: {
      frontity: {
        url: "https://test.frontity.org",
        title: "Ways4eu WordPress.com Blog",
        description: "WordPress Site in Frontity development",
      },
    },
    packages: [
      {
        name: "frontity-chakra-theme",
        state: {
          theme: {
            // The logo can be a text or an image url
            logo: "Frontity",
            // show background pattern
            showBackgroundPattern: true,
            // show social links
            showSocialLinks: true,
            // the top-level navigation labels and links
            menu: [
              [
                "Home",
                "/"
              ],
              [
                "Hot-React",
                "/category/hot-react"
              ],
              [
                "Tips&Tricks",
                "/category/tips_tricks"
              ],
              [
                "ReadingList",
                "/category/readinglist"
              ],
              [
                "Education",
                "/category/education"
              ], 
              [
                "Javascript",
                "/tag/javascript"
              ],                                    
              [
                "Wikipedia",
                "/category/wikipedia"
              ],
              [
                "NASA",
                "/category/nasa"
              ],            
              [
                "Art",
                "/tag/art"
              ],                                                            
              [
                "Music",
                "/tag/music"
              ]            
            ],
            // the social links
            socialLinks: [
              ["pinterest", "https://www.pinterest.com/frontity/"],
              ["facebook", "https://www.instagram.com/frontity/"],
              ["twitter", "https://www.twitter.com/frontity/"],
            ],
            // color shades to use in the blog
            colors: {
              primary: {
                "50": "#e9f5f2",
                "100": "#d4dcd9",
                "200": "#bbc3be",
                "300": "#a1aba5",
                "400": "#87938b",
                "500": "#6d7972",
                "600": "#555f58",
                "700": "#323c34",
                "800": "#232924",
                "900": "#272727",
              },
              accent: {
                "50": "#ede4d3",
                "100": "#fbe3b2",
                "200": "#f6d086",
                "300": "#f1be58",
                "400": "#eca419",
                "500": "#d49212",
                "600": "#a5710b",
                "700": "#775105",
                "800": "#483100",
                "900": "#1d0f00",
              },
            },
          },
        },
      },
      {
        name: "@frontity/wp-source",
        state: {
          source: {
            api:
              "https://public-api.wordpress.com/wp/v2/sites/ways4eu.wordpress.com",
          },
        },
      },
      "@frontity/tiny-router",
      "@frontity/html2react",
    ],
  };
  
  export default settings;
  