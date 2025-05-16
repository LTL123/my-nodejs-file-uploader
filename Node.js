const express = require('express');
const multer = require('multer');
const COS = require('cos-nodejs-sdk-v5');
const fs = require('fs');
const axios = require('axios');
const path = require('path');

const app = express();
const upload = multer({ dest: './uploads/' });

// 添加静态文件服务
app.use(express.static(__dirname));
app.use(express.json());

// Load environment variables
require('dotenv').config();

const cos = new COS({
    SecretId: process.env.COS_SECRET_ID,
    SecretKey: process.env.COS_SECRET_KEY
});

app.post('/upload', upload.single('file'), (req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).json({ message: '没有文件上传' });
    }

    console.log('收到文件上传请求:', {
        originalname: file.originalname,
        path: file.path,
        size: file.size
    });

    cos.putObject({
        Bucket: 'phlox-1333753512', // Bucket需要用户自行修改
        Region: 'ap-guangzhou', // Region需要用户自行修改
        Key: file.originalname,
        Body: require('fs').createReadStream(file.path),
        onProgress: function(progressData) {
            // 移除直接写入响应的进度回调
        }
    }, (err, data) => {
        // Clean up the uploaded file from the temporary 'uploads' directory
        fs.unlink(file.path, unlinkErr => {
            if (unlinkErr) {
                console.error('删除临时文件失败:', unlinkErr);
            }
        });

        if (err) {
            console.error('上传到腾讯云失败:', err.stack || err);
            console.log('上传文件详情:', {
                originalname: file.originalname,
                size: file.size,
                mimetype: file.mimetype,
                path: file.path
            });
            console.log('COS上传参数:', {
                Bucket: 'phlox-1333753512', // Bucket需要用户自行修改
                Region: 'ap-guangzhou', // Region需要用户自行修改
                Key: file.originalname,
                Body: file.path
            });
            return res.status(500).json({ 
                message: '上传失败',
                error: err.message,
                stack: err.stack
            });
        }
        const fileUrl = `https://${data.Location}`;
        const response = {
            type: 'result',
            message: '上传成功',
            url: fileUrl,
            data,
            progress: 100,
            filePath: file.path
        };
        console.log('上传成功，返回数据:', response);
        res.json(response);
    });
});

// 添加文件解读功能
app.post('/analyze', async (req, res) => {
    const { fileUrl } = req.body;
    console.log('收到分析请求，文件URL:', fileUrl);
    
    try {
        if (!fileUrl) {
            throw new Error('文件URL不能为空');
        }

        // 调用 OpenRouter API
        // 注意: API Key硬编码在此处，生产环境应通过环境变量配置
        const openRouterApiKey = process.env.OPENROUTER_API_KEY || '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';
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: 'qwen/qwen2.5-vl-72b-instruct:free', // 可以选择其他模型
            messages: [
                {
                    role: 'system',
                    content:[
                        {
                            type:'text',
                            text:'你是一个你画我猜的高手。'
                        }
                    ]
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: '请你根据图片回答：“这是什么？”'
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: fileUrl
                            }
                        }
                    ]
                }
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${openRouterApiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': req.headers.referer || 'http://localhost:3000' // 添加Referer
            }
        });

        console.log('OpenRouter API 响应成功');
        res.json({
            success: true,
            analysis: response.data.choices[0].message.content
        });
    } catch (error) {
        console.error('文件解读失败:', error.response ? error.response.data : error.message);
        res.status(500).json({
            success: false,
            error: error.response ? error.response.data : error.message
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`服务器已启动，监听端口${PORT}`);
});
