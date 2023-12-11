import{_ as e,o as a,c as i,e as t}from"./app-a3a2c649.js";const r={},n=t(`<h1 id="第7章-freertos源码概述" tabindex="-1"><a class="header-anchor" href="#第7章-freertos源码概述" aria-hidden="true">#</a> 第7章 FreeRTOS源码概述</h1><h2 id="_7-1-freertos目录结构" tabindex="-1"><a class="header-anchor" href="#_7-1-freertos目录结构" aria-hidden="true">#</a> 7.1 FreeRTOS目录结构</h2><p>使用STM32CubeMX创建的FreeRTOS工程中，FreeRTOS相关的源码如下:</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-7/image1.png" alt=""></p><p>主要涉及2个目录：</p><ul><li>Core <ul><li>Inc目录下的FreeRTOSConfig.h是配置文件</li><li>Src目录下的freertos.c是STM32CubeMX创建的默认任务</li></ul></li><li>Middlewares\\Third_Party\\FreeRTOS\\Source <ul><li>根目录下是核心文件，这些文件是通用的</li><li>portable目录下是移植时需要实现的文件 <ul><li>目录名为：[compiler]/[architecture]</li><li>比如：RVDS/ARM_CM3，这表示cortexM3架构在RVDS工具上的移植文件</li></ul></li></ul></li></ul><p>7.2核心文件 FreeRTOS的最核心文件只有2个：</p><ul><li><p>FreeRTOS/Source/tasks.c</p></li><li><p>FreeRTOS/Source/list.c</p><p>其他文件的作用也一起列表如下：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-7/image2.jpg" alt="image2"></p></li></ul><h2 id="_7-3-移植时涉及的文件" tabindex="-1"><a class="header-anchor" href="#_7-3-移植时涉及的文件" aria-hidden="true">#</a> 7.3 移植时涉及的文件</h2><p>移植FreeRTOS时涉及的文件放在 <strong>FreeRTOS/Source/portable/[compiler]/[architecture]</strong> 目录下，比如：RVDS/ARM_CM3，这表示cortexM3架构在RVDS或Keil工具上的移植文件。 里面有2个文件：</p><ul><li>port.c</li><li>portmacro.h</li></ul><h2 id="_7-4-头文件相关" tabindex="-1"><a class="header-anchor" href="#_7-4-头文件相关" aria-hidden="true">#</a> 7.4 头文件相关</h2><h3 id="_7-4-1-头文件目录" tabindex="-1"><a class="header-anchor" href="#_7-4-1-头文件目录" aria-hidden="true">#</a> 7.4.1 头文件目录</h3><p>FreeRTOS需要3个头文件目录：</p><ul><li>FreeRTOS本身的头文件：</li></ul><p>Middlewares\\Third_Party\\FreeRTOS\\Source\\include</p><ul><li>移植时用到的头文件：</li></ul><p>Middlewares\\Third_Party\\FreeRTOS\\Source\\portable[compiler][architecture]</p><ul><li>含有配置文件FreeRTOSConfig.h的目录：Core\\Inc</li></ul><h3 id="_7-4-2-头文件" tabindex="-1"><a class="header-anchor" href="#_7-4-2-头文件" aria-hidden="true">#</a> 7.4.2 头文件</h3><p>列表如下：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-7/image3.jpg" alt="image3"></p><h2 id="_7-5-内存管理" tabindex="-1"><a class="header-anchor" href="#_7-5-内存管理" aria-hidden="true">#</a> 7.5 内存管理</h2><p>文件在Middlewares\\Third_Party\\FreeRTOS\\Source\\portable\\MemMang下，它也是放在“portable”目录下，表示你可以提供自己的函数。</p><p>源码中默认提供了5个文件，对应内存管理的5种方法。</p><p>后续章节会详细讲解。</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-7/image4.jpg" alt="image4"></p><h2 id="_7-6-入口函数" tabindex="-1"><a class="header-anchor" href="#_7-6-入口函数" aria-hidden="true">#</a> 7.6 入口函数</h2><p>在Core\\Src\\main.c的main函数里，初始化了FreeRTOS环境、创建了任务，然后启动调度器。源码如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* Init scheduler */</span>
  <span class="token function">osKernelInitialize</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>  <span class="token comment">/* 初始化FreeRTOS运行环境 */</span>
  <span class="token function">MX_FREERTOS_Init</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>    <span class="token comment">/* 创建任务 */</span>

  <span class="token comment">/* Start scheduler */</span>
  <span class="token function">osKernelStart</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>       <span class="token comment">/* 启动调度器 */</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_7-7-数据类型和编程规范" tabindex="-1"><a class="header-anchor" href="#_7-7-数据类型和编程规范" aria-hidden="true">#</a> 7.7 数据类型和编程规范</h2><h3 id="_7-7-1-数据类型" tabindex="-1"><a class="header-anchor" href="#_7-7-1-数据类型" aria-hidden="true">#</a> 7.7.1 数据类型</h3><p>每个移植的版本都含有自己的portmacro.h头文件，里面定义了2个数据类型：</p><ul><li>TickType_t： <ul><li>FreeRTOS配置了一个周期性的时钟中断：Tick Interrupt</li><li>每发生一次中断，中断次数累加，这被称为tick count</li><li>tick count这个变量的类型就是TickType_t</li><li>TickType_t可以是16位的，也可以是32位的</li><li>FreeRTOSConfig.h中定义configUSE_16_BIT_TICKS时，TickType_t就是uint16_t</li><li>否则TickType_t就是uint32_t</li><li>对于32位架构，建议把TickType_t配置为uint32_t</li></ul></li><li>BaseType_t： <ul><li>这是该架构最高效的数据类型</li><li>32位架构中，它就是uint32_t</li><li>16位架构中，它就是uint16_t</li><li>8位架构中，它就是uint8_t</li><li>BaseType_t通常用作简单的返回值的类型，还有逻辑值，比如pdTRUE/pdFALSE</li></ul></li></ul><h3 id="_7-7-2-变量名" tabindex="-1"><a class="header-anchor" href="#_7-7-2-变量名" aria-hidden="true">#</a> 7.7.2 变量名</h3><p>变量名有前缀：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-7/image5.jpg" alt="image5"></p><h3 id="_7-7-3-函数名" tabindex="-1"><a class="header-anchor" href="#_7-7-3-函数名" aria-hidden="true">#</a> 7.7.3 函数名</h3><p>函数名的前缀有2部分：返回值类型、在哪个文件定义。</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-7/image6.jpg" alt="image6"></p><h3 id="_7-7-4-宏的名" tabindex="-1"><a class="header-anchor" href="#_7-7-4-宏的名" aria-hidden="true">#</a> 7.7.4 宏的名</h3><p>宏的名字是大小，可以添加小写的前缀。前缀是用来表示：宏在哪个文件中定义。</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-7/image7.jpg" alt="image7"></p><p>通用的宏定义如下：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-7/image8.jpg" alt="image8"></p>`,45),s=[n];function l(c,p){return a(),i("div",null,s)}const h=e(r,[["render",l],["__file","chapter7.html.vue"]]);export{h as default};
