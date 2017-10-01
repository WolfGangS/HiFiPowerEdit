var EntitySchema = {
    id: "EntitySchema",
    title: "Entity",
    type: "object",
    properties: {
        type: {
            type: "string",
            enum: [
                "Box",
                "Sphere",
                "Light",
                "Text",
                "Web",
                "Zone",
                "ParticleEffect",
                "Model"
            ]
        },
        name: { type: "string" },
        //locked: { type: "integer", enum: [0, 1] },
        lifetime: { type: "integer", default: -1, minimum: -1, maximum: 1000000 },
        color: { "$ref": "rgb" },
        dimensions: { "$ref": "vec3" },
        position: { "$ref": "vec3" },
        rotation: { "$ref": "vec4" },
        parentID: { "$ref": "uuid" },
        owningAvatarID: { "$ref": "uuid" },
        //dynamic: { type: "integer", enum: [0, 1] },
        //visible: { type: "integer", enum: [0, 1] },
        gravity: { "$ref": "vec3" },
        angularVelocity: { "$ref": "vec3" },
        registrationPoint: { "$ref": "vec3%" },
    },
    required: [
        "type"
    ]
};

var SchemaRefs = {
    vec4: { type: "object", properties: { w: { type: "number", default: 0.2 }, x: { type: "number", default: 0.2 }, y: { type: "number", default: 0.2 }, z: { type: "number", default: 0.2 } }, required: ["w", "x", "y", "z"] },
    vec3: { type: "object", properties: { x: { type: "number", default: 0.2 }, y: { type: "number", default: 0.2 }, z: { type: "number", default: 0.2 } }, required: ["x", "y", "z"] },
    "vec3%": { type: "object", properties: { x: { type: "number", default: 0.5, minimum: 0, maximum: 1}, y: { type: "number", default: 0.5, minimum: 0, maximum: 1 }, z: { type: "number", default: 0.5, minimum: 0, maximum: 1 } }, required: ["x", "y", "z"] },
    rgb: { type: "object", properties: { red: { type: "integer", maximum: 255, minimum: 0, default: 0 }, green: { type: "integer", maximum: 255, minimum: 0, default: 0 }, blue: { type: "integer", maximum: 255, minimum: 0, default: 0 } }, required: ["red", "green", "blue"] },
    uuid: { type: "string", pattern: "^\\{[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}\\}$" }
};