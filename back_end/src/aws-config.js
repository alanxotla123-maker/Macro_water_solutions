const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const REGION = "us-east-2"; // <-- ¡CAMBIA ESTO por la región de tu bucket en AWS!

const s3Client = new S3Client({
    region: REGION, 
    credentials: {
        accessKeyId: "AKIAS5R34OBXH75RN3WK",
        secretAccessKey: "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",
    },
});

const subirImagenAS3 = async (nombreArchivo, contenidoArchivo, tipoMime) => {
    const params = {
        Bucket: "aquacleanpro", 
        Key: `productos/${Date.now()}-${nombreArchivo}`,
        Body: contenidoArchivo,
        ContentType: tipoMime,
    };

    try {
        await s3Client.send(new PutObjectCommand(params));
        // URL corregida para soportar cualquier región
        return `https://${params.Bucket}.s3.${REGION}.amazonaws.com/${params.Key}`;
    } catch (err) {
        console.error("Error en AWS S3:", err);
        throw err;
    }
};

module.exports = { subirImagenAS3 };