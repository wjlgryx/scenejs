/**
 * Backend that manages scene flags. These are pushed and popped by "flags" nodes
 * to enable/disable features for the subgraph. An important point to note about these
 * is that they never trigger the generation of new GLSL shaders - flags are designed
 * to switch things on/of with minimal overhead.
 *
 * @private
 */
SceneJS._flagsModule = new (function() {

    var flagStack = new Array(255);
    var stackLen = 0;
    var dirty;

    this.flags = {}; // Flags at top of flag stack

    /** Creates flag set by inheriting flags off top of stack where not overridden
     */
    function createFlags(flags) {
        if (flagStack.length == 0) {
            return flags;
        }
        var topFlags = flagStack[stackLen - 1];
        var flag;
        for (var name in topFlags) {
            if (topFlags.hasOwnProperty(name)) {
                flag = flags[name];
                if (flag == null || flag == undefined) {
                    flags[name] = topFlags[name];
                }
            }
        }
        return flags;
    }

    /* Make fresh flag stack for new render pass, containing default flags
     * to enable/disable various things for subgraph
     */
    var self = this;
    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SCENE_RENDERING,
            function() {
                self.flags = {
                    fog: true,          // Fog enabled
                    colortrans : true,  // Effect of colortrans enabled
                    picking : true,     // Picking enabled
                    enabled : true,     // Node not culled from traversal
                    visible : true      // Node visible - when false, everything happens except geometry draw
                };
                flagStack[0] = self.flags;                
                stackLen = 1;
                dirty = true;
            });

    /* Export flags when renderer needs them - only when current set not exported (dirty)
     */
    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SHADER_RENDERING,
            function() {
                if (dirty) {
                    SceneJS._shaderModule.setFlags(self.flags);
                    dirty = false;
                }
            });

    /* Push flags to top of stack - stack top becomes active flags
     */
    this.pushFlags = function(f) {
        this.flags = createFlags(f);   // TODO: memoize flags?
        flagStack[stackLen++] = this.flags;
        dirty = true;
    };

    /* Pop flags off stack - stack top becomes active flags
     */
    this.popFlags = function() {
        stackLen--;
        this.flags = flagStack[stackLen - 1];
        dirty = true;
    };

})();

