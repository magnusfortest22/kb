---
icon: hand-pointer
---

# 交互式块

除了您可以编写的默认 Markdown 之外，GitBook 还有许多现成的交互式块可供使用。您可以在编辑器中按 `/` 找到交互式块。

<figure><img src="https://gitbookio.github.io/onboarding-template-images/interactive-hero.png" alt=""><figcaption></figcaption></figure>

### 选项卡

{% tabs %}
{% tab title="第一个选项卡" %}
每个选项卡就像一个迷你页面 - 它可以包含任何类型的多个其他块。因此，您可以将代码块、图像、集成块等添加到同一选项卡块中的各个选项卡。
{% endtab %}

{% tab title="第二个选项卡" %}
添加图像、嵌入内容、代码块等。

```javascript
const handleFetchEvent = async (request, context) => {
return new Response({message: "Hello World"});
};
```
{% endtab %}
{% endtabs %}

### 可扩展部分

<details>

<summary>点击我展开</summary>

可扩展块有助于压缩原本冗长的段落。它们在分步指南和常见问题解答中也非常有用。

</details>

### 绘图

<img alt="" class="gitbook-drawing">

### 嵌入内容

{% embed url="https://www.youtube.com/watch?v=YILlrDYzAm4" %}

{% hint style="info" %}
GitBook 支持数千个现成的嵌入式网站，只需粘贴其链接即可。请随意查看哪些[是原生支持的](https://iframely.com)。
{% endhint %}

