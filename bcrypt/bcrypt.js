import bcrypt from "bcrypt";

const myPassword = "password1111";
const saltRounds = 8;

async function authHash() {
    try {
        console.log(
            "==========================================\n==========================================",
        );
        console.log(`My Password: "${myPassword}"\n`);

        // Hash
        console.log("Hash");
        const hashPassword = await bcrypt.hash(myPassword, saltRounds);
        console.log(`Hashed Password:`);
        console.log(`${hashPassword}\n`);

        // Compare
        console.log("Compare");
        // result: match
        const isMatch = await bcrypt.compare(myPassword, hashPassword);
        console.log(`Compare Correct!: ${isMatch}`);
        // result: not match
        const wrongPassword = "password0000";
        const isMatchWrong = await bcrypt.compare(wrongPassword, hashPassword);
        console.log(`Compare Wrong!: ${isMatchWrong}`);
        console.log(
            "==========================================\n==========================================",
        );
    } catch (err) {
        console.error("Error:", err);
    }
}

authHash();
