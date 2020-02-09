Welcome to the feiyan wiki!
# 需要接口说明
## 1.拉取智能分类列表
### 说明
根据用户输入拉取分类文章结果
### 请求url
/getMessages
### 请求参数及其说明
|参数名          | 类型           | 说明  |
| ------------- |:-------------:| -----:|
| seqId     | string | 请求id |
| searchStr      | string | 用户输入的请求搜索字符串 |

### 示例
`{/
    "seqId":2344,/
    "searchStr":"消毒"/
}`
### 返回参数及其说明
|参数名          | 类型           | 说明  |
| ------------- |:-------------:| -----:|
| code| int| 状态码，0为成功，1为失败 |
| articles| array| 返回的消息，是一个字符串数组 |

### 示例
`{
    "code": 0,
    "articles":[
            {
                "title": "标题",
                "author": "作者",
                "date":"日期",
                "text":"正文",
                "eferenceLink":["url1","url2"]
            },
            {
               "title": "标题2",
                "author": "作者2",
                "date":"日期",
                "text":"正文",
                "eferenceLink":["url1","url2"]
            }
         ]
}`

