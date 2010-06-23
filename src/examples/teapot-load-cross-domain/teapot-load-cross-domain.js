/**
 * SceneJS Example - Importing a remotely-stored SceneJS teapot into a scene
 *
 * Lindsay Kay
 * lindsay.kay@xeolabs.com
 * January 2010
 *
 * SceneJS is geared to composition of scenes from re-usable, parameterised
 * fragments. It can automatically manage a lean set of in-memory fragments by
 * loading them cross-domain on demand, while evicting them following a
 * least-recently-used policy to maintain the pool of free memory. Its terse
 * API means that fragments are compact, allowing them to propagate rapidly
 * across the network. Being JavaScript, they evaluate straight into the
 * browser with no expensive parsing.
 *
 * This example loads an orange teapot from the asset repository
 * at SceneJS.com.
 *
 * When the scene is first rendered, the SceneJS.instance node will make a
 * JSONP request of the repository, which will respond with the fragment,
 * which it will then evaluate into a subgraph of scene content.
 *
 * The SceneJS.instance's request will always be asynchronous. This means
 * that when SceneJS renders the SceneJS.instance, it's not going to wait
 * for the fragment to load before continuing to render the rest of the
 * scene. SceneJS will just trigger the request and move on. So if you're
 * rendering one frame, you wont see the new content in the
 * image. But if you keep rendering the scene for a few frames like
 * in this example, as you would when animating, it will magically appear
 * once loaded.
 */

var exampleScene = SceneJS.scene({

    /* Bind scene to a WebGL canvas:
     */
    canvasId: "theCanvas",

    /* You can optionally write logging to a DIV - scene will log to the console as well.
     */
    loggingElementId: "theLoggingDiv" },

        SceneJS.lookAt({
            eye : { x: 0.0, y: 20.0, z: -20},
            look : { x : 0.0, y : 0.0, z : 0 },
            up : { x: 0.0, y: 1.0, z: 0.0 }

        },
            /* Perspective camera
             */
                SceneJS.camera({
                    optics: {
                        type: "perspective",
                        fovy : 25.0,
                        aspect : 1.0,
                        near : 0.10,
                        far : 300.0  }
                },

                        SceneJS.lights({
                            sources: [
                                {
                                    type:                   "dir",
                                    color:                  { r: 1.0, g: 0.5, b: 0.5 },
                                    diffuse:                true,
                                    specular:               true,
                                    dir:                    { x: 1.0, y: 1.0, z: -1.0 }
                                },
                                {
                                    type:                   "dir",
                                    color:                  { r: 0.5, g: 1.0, b: 0.5 },
                                    diffuse:                true,
                                    specular:               true,
                                    dir:                    { x: 0.0, y: 1.0, z: -1.0 }
                                },
                                {
                                    type:                   "dir",
                                    color:                  { r: 0.2, g: 0.2, b: 1.0 },
                                    diffuse:                true,
                                    specular:               true,
                                    dir:                    { x: -1.0, y: 0.0, z: -1.0 }
                                }
                            ]},

                            /** Load the asset
                             */
                                SceneJS.instance({
                                    uri:"http://scenejs.org/library/v0.7/assets/examples/orange-teapot/orange-teapot.js"
                                })

                                )
                        )
                )
        );


/*---------------------------------------------------------------------------------------------------------------------
 * To enable the teapot to load cross-domain, we'll first configure SceneJS with a strategy to allow it
 * to use a Web service to proxy the JSONP load request. As shown here, the strategy implements two methods, one to
 * create the request URL for the service, and another to extract the data from the response.
 *-------------------------------------------------------------------------------------------------------------------*/
SceneJS.setJSONPStrategy({
    request : function(url, format, callback) {
        return "http://scenejs.org/cgi-bin/jsonp_proxy.pl?uri=" + url + "&format=" + format + "&callback=" + callback;
    },

    response : function(data) {

        /* The SceneJS proxy will provide an error message like this when
         * it fails to service the request
         */
        if (data.error) {
            throw "Proxy server responded with error: " + data.error;
        }
        return data;
    }
});


/*----------------------------------------------------------------------
 * Scene rendering loop and process query stuff follows
 *---------------------------------------------------------------------*/

/* Our periodic render function.
 */
window.render = function() {
    exampleScene.render();
};

/* Render loop until error or reset 
 * (which IDE does whenever you hit that run again button)
 */
var pInterval;

SceneJS.addListener("error", function() {
    window.clearInterval(pInterval);
});

SceneJS.addListener("reset", function() {
    window.clearInterval(pInterval);
});

pInterval = window.setInterval("window.render()", 10);
