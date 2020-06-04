const settings = {
  "name": "ways4euwp-01",
  "state": {
    "frontity": {
      "url": "https://ways4eu.wordpress.com/",
      "title": "Ways4eu WordPress.com Blog",
      "description": "WordPress Site in Frontity development"
    }
  },
  "packages": [
    {
      "name": "@frontity/mars-theme",
      "state": {
        "theme": {
          "menu": [
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
              "Reading List",
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
          "featured": {
            "showOnList": false,
            "showOnPost": false
          }
        }
      }
    },
    {
      "name": "@frontity/wp-source",
      "state": {
        "source": {
          "api": "https://public-api.wordpress.com/wp/v2/sites/ways4eu.wordpress.com"
        }
      }
    },
    "@frontity/tiny-router",
    "@frontity/html2react"
  ]
};

export default settings;
