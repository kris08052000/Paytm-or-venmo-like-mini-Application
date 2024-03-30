const express = require("express");
const zod = require("zod")
const jwt = require("jsonwebtoken");
const { User, Account } = require("../db");
const { JWT_SECRET } = require("../config");
const {authmiddleware} = require("../middleware")
const  router = express.Router();
router.use(express.json())

const signupSchema = zod.object({
    username : zod.string().email(),
    password : zod.string(),
    firstname: zod.string(),
    lastname: zod.string()
})

const signinSchema = zod.object({
    username : zod.string().email(),
    password : zod.string()
})

const updateBody = zod.object({
	password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional(),
})

router.post("/signup", async (req, res) => {
    const { success } = signupSchema.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            message: "Email already taken / Incorrect inputs"
        })
    }

    const existingUser = await User.findOne({
        username: req.body.username
    })

    if (existingUser) {
        return res.status(411).json({
            message: "Email already taken/Incorrect inputs"
        })
    }

    const user = await User.create({
        username: req.body.username,
        password: req.body.password,
        firstname: req.body.firstname,
        lastname: req.body.lastname
    })
    const userId = user._id;
		/// ----- Create new account ------

    await Account.create({
        userId,
        balance: 1 + Math.random() * 10000
    })

		/// -----  ------

    const token = jwt.sign({
        userId
    }, JWT_SECRET);

    res.json({
        message: "User created successfully",
        token: token
    })
})


router.get("/signin", async (req, res) => {
    const { success } = signinSchema.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            message: "Email already taken / Incorrect inputs"
        })
    }

    const user = await User.findOne({
        username: req.body.username,
        password: req.body.password
    });

    if (user) {
        const token = jwt.sign({
            userId: user._id
        }, JWT_SECRET);
  
        res.json({
            token: token
        })
        return;
    }
    
    res.status(411).json({
        message: "Error while logging in"
    })
})

router.put("/", authmiddleware, async (req,res)=>{
    const {success} = updateBody.safeParse(req.body);
    if(!success){
        return res.status(411).json({
            message:"Error while updating information"
        })
    }

    await User.updateOne({_id:req.userId}, req.body);

    res.json({
        message: "Updated successfully"
    })
})
    router.get("/bulk", async(req,res)=>{
        const filter = req.query.filter || "";

        const users = await User.find({
            $or: [{
                firstname: {
                    "$regex" : filter
                }
            },
            {
                lastname: {
                    "$regex" : filter
                }
            }]
        })
        res.json({
            user: users.map(user=>({
                username: user.username,
                firstname:  user.firstname,
                lastname: user.lastname,
                _id: user._id
            }))
        })
    })



module.exports = router;