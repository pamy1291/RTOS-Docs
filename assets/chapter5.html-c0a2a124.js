import{_ as i,r as a,o as c,c as o,a as s,b as n,d as e,w as l,e as u}from"./app-a3a2c649.js";const d={},r=u(`<h1 id="第五章-队列-queue" tabindex="-1"><a class="header-anchor" href="#第五章-队列-queue" aria-hidden="true">#</a> 第五章 队列(queue)</h1><p>队列(queue)可以用于&quot;任务到任务&quot;、&quot;任务到中断&quot;、&quot;中断到任务&quot;直接传输信息。</p><p>本章涉及如下内容：</p><ul><li>怎么创建、清除、删除队列</li><li>队列中消息如何保存</li><li>怎么向队列发送数据、怎么从队列读取数据、怎么覆盖队列的数据</li><li>在队列上阻塞是什么意思</li><li>怎么在多个队列上阻塞</li><li>读写队列时如何影响任务的优先级</li></ul><h2 id="_5-1-队列的特性" tabindex="-1"><a class="header-anchor" href="#_5-1-队列的特性" aria-hidden="true">#</a> 5.1 队列的特性</h2><h3 id="_5-1-1-常规操作" tabindex="-1"><a class="header-anchor" href="#_5-1-1-常规操作" aria-hidden="true">#</a> 5.1.1 常规操作</h3><p>队列的简化操如入下图所示，从此图可知：</p><ul><li>队列可以包含若干个数据：队列中有若干项，这被称为&quot;长度&quot;(length)</li><li>每个数据大小固定</li><li>创建队列时就要指定长度、数据大小</li><li>数据的操作采用先进先出的方法(FIFO，First In First Out)：写数据时放到尾部，读数据时从头部读</li><li>也可以强制写队列头部：覆盖头部数据</li></ul><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/simulator/chapter-5/02_queue.png" alt="image-20210802235434145"></p><p>更详细的操作入下图所示：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/simulator/chapter-5/03_queue_detail.png" alt="image-20210803001909785"></p><h3 id="_5-1-2-传输数据的两种方法" tabindex="-1"><a class="header-anchor" href="#_5-1-2-传输数据的两种方法" aria-hidden="true">#</a> 5.1.2 传输数据的两种方法</h3><p>使用队列传输数据时有两种方法：</p><ul><li>拷贝：把数据、把变量的值复制进队列里</li><li>引用：把数据、把变量的地址复制进队列里</li></ul><p>FreeRTOS使用拷贝值的方法，这更简单：</p><ul><li><p>局部变量的值可以发送到队列中，后续即使函数退出、局部变量被回收，也不会影响队列中的数据</p></li><li><p>无需分配buffer来保存数据，队列中有buffer</p></li><li><p>局部变量可以马上再次使用</p></li><li><p>发送任务、接收任务解耦：接收任务不需要知道这数据是谁的、也不需要发送任务来释放数据</p></li><li><p>如果数据实在太大，你还是可以使用队列传输它的地址</p></li><li><p>队列的空间有FreeRTOS内核分配，无需任务操心</p></li><li><p>对于有内存保护功能的系统，如果队列使用引用方法，也就是使用地址，必须确保双方任务对这个地址都有访问权限。使用拷贝方法时，则无此限制：内核有足够的权限，把数据复制进队列、再把数据复制出队列。</p></li></ul><h3 id="_5-1-3-队列的阻塞访问" tabindex="-1"><a class="header-anchor" href="#_5-1-3-队列的阻塞访问" aria-hidden="true">#</a> 5.1.3 队列的阻塞访问</h3><p>只要知道队列的句柄，谁都可以读、写该队列。任务、ISR都可读、写队列。可以多个任务读写队列。</p><p>任务读写队列时，简单地说：如果读写不成功，则阻塞；可以指定超时时间。口语化地说，就是可以定个闹钟：如果能读写了就马上进入就绪态，否则就阻塞直到超时。</p><p>某个任务读队列时，如果队列没有数据，则该任务可以进入阻塞状态：还可以指定阻塞的时间。如果队列有数据了，则该阻塞的任务会变为就绪态。如果一直都没有数据，则时间到之后它也会进入就绪态。</p><p>既然读取队列的任务个数没有限制，那么当多个任务读取空队列时，这些任务都会进入阻塞状态：有多个任务在等待同一个队列的数据。当队列中有数据时，哪个任务会进入就绪态？</p><ul><li>优先级最高的任务</li><li>如果大家的优先级相同，那等待时间最久的任务会进入就绪态</li></ul><p>跟读队列类似，一个任务要写队列时，如果队列满了，该任务也可以进入阻塞状态：还可以指定阻塞的时间。如果队列有空间了，则该阻塞的任务会变为就绪态。如果一直都没有空间，则时间到之后它也会进入就绪态。</p><p>既然写队列的任务个数没有限制，那么当多个任务写&quot;满队列&quot;时，这些任务都会进入阻塞状态：有多个任务在等待同一个队列的空间。当队列中有空间时，哪个任务会进入就绪态？</p><ul><li>优先级最高的任务</li><li>如果大家的优先级相同，那等待时间最久的任务会进入就绪态</li></ul><h2 id="_5-2-队列函数" tabindex="-1"><a class="header-anchor" href="#_5-2-队列函数" aria-hidden="true">#</a> 5.2 队列函数</h2><p>使用队列的流程：创建队列、写队列、读队列、删除队列。</p><h3 id="_5-2-1-创建" tabindex="-1"><a class="header-anchor" href="#_5-2-1-创建" aria-hidden="true">#</a> 5.2.1 创建</h3><p>队列的创建有两种方法：动态分配内存、静态分配内存，</p><ul><li>动态分配内存：xQueueCreate，队列的内存在函数内部动态分配</li></ul><p>函数原型如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code>QueueHandle_t <span class="token function">xQueueCreate</span><span class="token punctuation">(</span> UBaseType_t uxQueueLength<span class="token punctuation">,</span> UBaseType_t uxItemSize <span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><table><thead><tr><th>参数</th><th>说明</th></tr></thead><tbody><tr><td>uxQueueLength</td><td>队列长度，最多能存放多少个数据(item)</td></tr><tr><td>uxItemSize</td><td>每个数据(item)的大小：以字节为单位</td></tr><tr><td>返回值</td><td>非0：成功，返回句柄，以后使用句柄来操作队列<br>NULL：失败，因为内存不足</td></tr></tbody></table><ul><li>静态分配内存：xQueueCreateStatic，队列的内存要事先分配好</li></ul><p>函数原型如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code>QueueHandle_t <span class="token function">xQueueCreateStatic</span><span class="token punctuation">(</span>
                           UBaseType_t uxQueueLength<span class="token punctuation">,</span>
                           UBaseType_t uxItemSize<span class="token punctuation">,</span>
                           <span class="token class-name">uint8_t</span> <span class="token operator">*</span>pucQueueStorageBuffer<span class="token punctuation">,</span>
                           StaticQueue_t <span class="token operator">*</span>pxQueueBuffer
                       <span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><table><thead><tr><th>参数</th><th>说明</th></tr></thead><tbody><tr><td>uxQueueLength</td><td>队列长度，最多能存放多少个数据(item)</td></tr><tr><td>uxItemSize</td><td>每个数据(item)的大小：以字节为单位</td></tr><tr><td>pucQueueStorageBuffer</td><td>如果uxItemSize非0，pucQueueStorageBuffer必须指向一个uint8_t数组，<br>此数组大小至少为&quot;uxQueueLength * uxItemSize&quot;</td></tr><tr><td>pxQueueBuffer</td><td>必须执行一个StaticQueue_t结构体，用来保存队列的数据结构</td></tr><tr><td>返回值</td><td>非0：成功，返回句柄，以后使用句柄来操作队列<br>NULL：失败，因为pxQueueBuffer为NULL</td></tr></tbody></table><p>示例代码：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">// 示例代码</span>
 <span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">define</span> <span class="token macro-name">QUEUE_LENGTH</span> <span class="token expression"><span class="token number">10</span></span></span>
 <span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">define</span> <span class="token macro-name">ITEM_SIZE</span> <span class="token expression"><span class="token keyword">sizeof</span><span class="token punctuation">(</span> <span class="token class-name">uint32_t</span> <span class="token punctuation">)</span></span></span>
 
 <span class="token comment">// xQueueBuffer用来保存队列结构体</span>
 StaticQueue_t xQueueBuffer<span class="token punctuation">;</span>
 
 <span class="token comment">// ucQueueStorage 用来保存队列的数据</span>
 <span class="token comment">// 大小为：队列长度 * 数据大小</span>
 <span class="token class-name">uint8_t</span> ucQueueStorage<span class="token punctuation">[</span> QUEUE_LENGTH <span class="token operator">*</span> ITEM_SIZE <span class="token punctuation">]</span><span class="token punctuation">;</span>
 
 <span class="token keyword">void</span> <span class="token function">vATask</span><span class="token punctuation">(</span> <span class="token keyword">void</span> <span class="token operator">*</span>pvParameters <span class="token punctuation">)</span>
 <span class="token punctuation">{</span>
	QueueHandle_t xQueue1<span class="token punctuation">;</span>
 
	<span class="token comment">// 创建队列: 可以容纳QUEUE_LENGTH个数据，每个数据大小是ITEM_SIZE</span>
	xQueue1 <span class="token operator">=</span> <span class="token function">xQueueCreateStatic</span><span class="token punctuation">(</span> QUEUE_LENGTH<span class="token punctuation">,</span>
						  ITEM_SIZE<span class="token punctuation">,</span>
						  ucQueueStorage<span class="token punctuation">,</span>
						  <span class="token operator">&amp;</span>xQueueBuffer <span class="token punctuation">)</span><span class="token punctuation">;</span> 
 <span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_5-2-2-复位" tabindex="-1"><a class="header-anchor" href="#_5-2-2-复位" aria-hidden="true">#</a> 5.2.2 复位</h3><p>队列刚被创建时，里面没有数据；使用过程中可以调用<code>xQueueReset()</code>把队列恢复为初始状态，此函数原型为：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* pxQueue : 复位哪个队列;
 * 返回值: pdPASS(必定成功)
 */</span>
BaseType_t <span class="token function">xQueueReset</span><span class="token punctuation">(</span> QueueHandle_t pxQueue<span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_5-2-3-删除" tabindex="-1"><a class="header-anchor" href="#_5-2-3-删除" aria-hidden="true">#</a> 5.2.3 删除</h3><p>删除队列的函数为<code>vQueueDelete()</code>，只能删除使用动态方法创建的队列，它会释放内存。原型如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token keyword">void</span> <span class="token function">vQueueDelete</span><span class="token punctuation">(</span> QueueHandle_t xQueue <span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h3 id="_5-2-4-写队列" tabindex="-1"><a class="header-anchor" href="#_5-2-4-写队列" aria-hidden="true">#</a> 5.2.4 写队列</h3><p>可以把数据写到队列头部，也可以写到尾部，这些函数有两个版本：在任务中使用、在ISR中使用。函数原型如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* 等同于xQueueSendToBack
 * 往队列尾部写入数据，如果没有空间，阻塞时间为xTicksToWait
 */</span>
BaseType_t <span class="token function">xQueueSend</span><span class="token punctuation">(</span>
                                QueueHandle_t    xQueue<span class="token punctuation">,</span>
                                <span class="token keyword">const</span> <span class="token keyword">void</span>       <span class="token operator">*</span>pvItemToQueue<span class="token punctuation">,</span>
                                TickType_t       xTicksToWait
                            <span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">/* 
 * 往队列尾部写入数据，如果没有空间，阻塞时间为xTicksToWait
 */</span>
BaseType_t <span class="token function">xQueueSendToBack</span><span class="token punctuation">(</span>
                                QueueHandle_t    xQueue<span class="token punctuation">,</span>
                                <span class="token keyword">const</span> <span class="token keyword">void</span>       <span class="token operator">*</span>pvItemToQueue<span class="token punctuation">,</span>
                                TickType_t       xTicksToWait
                            <span class="token punctuation">)</span><span class="token punctuation">;</span>


<span class="token comment">/* 
 * 往队列尾部写入数据，此函数可以在中断函数中使用，不可阻塞
 */</span>
BaseType_t <span class="token function">xQueueSendToBackFromISR</span><span class="token punctuation">(</span>
                                      QueueHandle_t xQueue<span class="token punctuation">,</span>
                                      <span class="token keyword">const</span> <span class="token keyword">void</span> <span class="token operator">*</span>pvItemToQueue<span class="token punctuation">,</span>
                                      BaseType_t <span class="token operator">*</span>pxHigherPriorityTaskWoken
                                   <span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">/* 
 * 往队列头部写入数据，如果没有空间，阻塞时间为xTicksToWait
 */</span>
BaseType_t <span class="token function">xQueueSendToFront</span><span class="token punctuation">(</span>
                                QueueHandle_t    xQueue<span class="token punctuation">,</span>
                                <span class="token keyword">const</span> <span class="token keyword">void</span>       <span class="token operator">*</span>pvItemToQueue<span class="token punctuation">,</span>
                                TickType_t       xTicksToWait
                            <span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">/* 
 * 往队列头部写入数据，此函数可以在中断函数中使用，不可阻塞
 */</span>
BaseType_t <span class="token function">xQueueSendToFrontFromISR</span><span class="token punctuation">(</span>
                                      QueueHandle_t xQueue<span class="token punctuation">,</span>
                                      <span class="token keyword">const</span> <span class="token keyword">void</span> <span class="token operator">*</span>pvItemToQueue<span class="token punctuation">,</span>
                                      BaseType_t <span class="token operator">*</span>pxHigherPriorityTaskWoken
                                   <span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这些函数用到的参数是类似的，统一说明如下：</p><table><thead><tr><th>参数</th><th>说明</th></tr></thead><tbody><tr><td>xQueue</td><td>队列句柄，要写哪个队列</td></tr><tr><td>pvItemToQueue</td><td>数据指针，这个数据的值会被复制进队列，<br>复制多大的数据？在创建队列时已经指定了数据大小</td></tr><tr><td>xTicksToWait</td><td>如果队列满则无法写入新数据，可以让任务进入阻塞状态，<br>xTicksToWait表示阻塞的最大时间(Tick Count)。<br>如果被设为0，无法写入数据时函数会立刻返回；<br>如果被设为portMAX_DELAY，则会一直阻塞直到有空间可写</td></tr><tr><td>返回值</td><td>pdPASS：数据成功写入了队列<br>errQUEUE_FULL：写入失败，因为队列满了。</td></tr></tbody></table><h3 id="_5-2-5-读队列" tabindex="-1"><a class="header-anchor" href="#_5-2-5-读队列" aria-hidden="true">#</a> 5.2.5 读队列</h3><p>使用<code>xQueueReceive()</code>函数读队列，读到一个数据后，队列中该数据会被移除。这个函数有两个版本：在任务中使用、在ISR中使用。函数原型如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code>BaseType_t <span class="token function">xQueueReceive</span><span class="token punctuation">(</span> QueueHandle_t xQueue<span class="token punctuation">,</span>
                          <span class="token keyword">void</span> <span class="token operator">*</span> <span class="token keyword">const</span> pvBuffer<span class="token punctuation">,</span>
                          TickType_t xTicksToWait <span class="token punctuation">)</span><span class="token punctuation">;</span>

BaseType_t <span class="token function">xQueueReceiveFromISR</span><span class="token punctuation">(</span>
                                    QueueHandle_t    xQueue<span class="token punctuation">,</span>
                                    <span class="token keyword">void</span>             <span class="token operator">*</span>pvBuffer<span class="token punctuation">,</span>
                                    BaseType_t       <span class="token operator">*</span>pxTaskWoken
                                <span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>参数说明如下：</p><table><thead><tr><th>参数</th><th>说明</th></tr></thead><tbody><tr><td>xQueue</td><td>队列句柄，要读哪个队列</td></tr><tr><td>pvBuffer</td><td>bufer指针，队列的数据会被复制到这个buffer<br>复制多大的数据？在创建队列时已经指定了数据大小</td></tr><tr><td>xTicksToWait</td><td>果队列空则无法读出数据，可以让任务进入阻塞状态，<br>xTicksToWait表示阻塞的最大时间(Tick Count)。<br>如果被设为0，无法读出数据时函数会立刻返回；<br>如果被设为portMAX_DELAY，则会一直阻塞直到有数据可写</td></tr><tr><td>返回值</td><td>pdPASS：从队列读出数据入<br>errQUEUE_EMPTY：读取失败，因为队列空了。</td></tr></tbody></table><h3 id="_5-2-6-查询" tabindex="-1"><a class="header-anchor" href="#_5-2-6-查询" aria-hidden="true">#</a> 5.2.6 查询</h3><p>可以查询队列中有多少个数据、有多少空余空间。函数原型如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*
 * 返回队列中可用数据的个数
 */</span>
UBaseType_t <span class="token function">uxQueueMessagesWaiting</span><span class="token punctuation">(</span> <span class="token keyword">const</span> QueueHandle_t xQueue <span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">/*
 * 返回队列中可用空间的个数
 */</span>
UBaseType_t <span class="token function">uxQueueSpacesAvailable</span><span class="token punctuation">(</span> <span class="token keyword">const</span> QueueHandle_t xQueue <span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_5-2-7-覆盖-偷看" tabindex="-1"><a class="header-anchor" href="#_5-2-7-覆盖-偷看" aria-hidden="true">#</a> 5.2.7 覆盖/偷看</h3><p>当队列长度为1时，可以使用<code>xQueueOverwrite()</code>或<code>xQueueOverwriteFromISR()</code>来覆盖数据。 注意，队列长度必须为1。当队列满时，这些函数会覆盖里面的数据，这也以为着这些函数不会被阻塞。 函数原型如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* 覆盖队列
 * xQueue: 写哪个队列
 * pvItemToQueue: 数据地址
 * 返回值: pdTRUE表示成功, pdFALSE表示失败
 */</span>
BaseType_t <span class="token function">xQueueOverwrite</span><span class="token punctuation">(</span>
                           QueueHandle_t xQueue<span class="token punctuation">,</span>
                           <span class="token keyword">const</span> <span class="token keyword">void</span> <span class="token operator">*</span> pvItemToQueue
                      <span class="token punctuation">)</span><span class="token punctuation">;</span>

BaseType_t <span class="token function">xQueueOverwriteFromISR</span><span class="token punctuation">(</span>
                           QueueHandle_t xQueue<span class="token punctuation">,</span>
                           <span class="token keyword">const</span> <span class="token keyword">void</span> <span class="token operator">*</span> pvItemToQueue<span class="token punctuation">,</span>
                           BaseType_t <span class="token operator">*</span>pxHigherPriorityTaskWoken
                      <span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如果想让队列中的数据供多方读取，也就是说读取时不要移除数据，要留给后来人。那么可以使用&quot;窥视&quot;，也就是<code>xQueuePeek()</code>或<code>xQueuePeekFromISR()</code>。这些函数会从队列中复制出数据，但是不移除数据。这也意味着，如果队列中没有数据，那么&quot;偷看&quot;时会导致阻塞；一旦队列中有数据，以后每次&quot;偷看&quot;都会成功。 函数原型如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* 偷看队列
 * xQueue: 偷看哪个队列
 * pvItemToQueue: 数据地址, 用来保存复制出来的数据
 * xTicksToWait: 没有数据的话阻塞一会
 * 返回值: pdTRUE表示成功, pdFALSE表示失败
 */</span>
BaseType_t <span class="token function">xQueuePeek</span><span class="token punctuation">(</span>
                          QueueHandle_t xQueue<span class="token punctuation">,</span>
                          <span class="token keyword">void</span> <span class="token operator">*</span> <span class="token keyword">const</span> pvBuffer<span class="token punctuation">,</span>
                          TickType_t xTicksToWait
                      <span class="token punctuation">)</span><span class="token punctuation">;</span>

BaseType_t <span class="token function">xQueuePeekFromISR</span><span class="token punctuation">(</span>
                                 QueueHandle_t xQueue<span class="token punctuation">,</span>
                                 <span class="token keyword">void</span> <span class="token operator">*</span>pvBuffer<span class="token punctuation">,</span>
                             <span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_5-3-示例8-队列的基本使用" tabindex="-1"><a class="header-anchor" href="#_5-3-示例8-队列的基本使用" aria-hidden="true">#</a> 5.3 示例8: 队列的基本使用</h2><p>本节代码为：<code>FreeRTOS_08_queue</code>。</p><p>本程序会创建一个队列，然后创建2个发送任务、1个接收任务：</p><ul><li>发送任务优先级为1，分别往队列中写入100、200</li><li>接收任务优先级为2，读队列、打印数值</li></ul><p>main函数中创建的队列、创建了发送任务、接收任务，代码如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* 队列句柄, 创建队列时会设置这个变量 */</span>
QueueHandle_t xQueue<span class="token punctuation">;</span>

<span class="token keyword">int</span> <span class="token function">main</span><span class="token punctuation">(</span> <span class="token keyword">void</span> <span class="token punctuation">)</span>
<span class="token punctuation">{</span>
	<span class="token function">prvSetupHardware</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
	
    <span class="token comment">/* 创建队列: 长度为5，数据大小为4字节(存放一个整数) */</span>
    xQueue <span class="token operator">=</span> <span class="token function">xQueueCreate</span><span class="token punctuation">(</span> <span class="token number">5</span><span class="token punctuation">,</span> <span class="token keyword">sizeof</span><span class="token punctuation">(</span> <span class="token class-name">int32_t</span> <span class="token punctuation">)</span> <span class="token punctuation">)</span><span class="token punctuation">;</span>

	<span class="token keyword">if</span><span class="token punctuation">(</span> xQueue <span class="token operator">!=</span> <span class="token constant">NULL</span> <span class="token punctuation">)</span>
	<span class="token punctuation">{</span>
		<span class="token comment">/* 创建2个任务用于写队列, 传入的参数分别是100、200
		 * 任务函数会连续执行，向队列发送数值100、200
		 * 优先级为1
		 */</span>
		<span class="token function">xTaskCreate</span><span class="token punctuation">(</span> vSenderTask<span class="token punctuation">,</span> <span class="token string">&quot;Sender1&quot;</span><span class="token punctuation">,</span> <span class="token number">1000</span><span class="token punctuation">,</span> <span class="token punctuation">(</span> <span class="token keyword">void</span> <span class="token operator">*</span> <span class="token punctuation">)</span> <span class="token number">100</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">,</span> <span class="token constant">NULL</span> <span class="token punctuation">)</span><span class="token punctuation">;</span>
		<span class="token function">xTaskCreate</span><span class="token punctuation">(</span> vSenderTask<span class="token punctuation">,</span> <span class="token string">&quot;Sender2&quot;</span><span class="token punctuation">,</span> <span class="token number">1000</span><span class="token punctuation">,</span> <span class="token punctuation">(</span> <span class="token keyword">void</span> <span class="token operator">*</span> <span class="token punctuation">)</span> <span class="token number">200</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">,</span> <span class="token constant">NULL</span> <span class="token punctuation">)</span><span class="token punctuation">;</span>

		<span class="token comment">/* 创建1个任务用于读队列
		 * 优先级为2, 高于上面的两个任务
		 * 这意味着队列一有数据就会被读走
		 */</span>
		<span class="token function">xTaskCreate</span><span class="token punctuation">(</span> vReceiverTask<span class="token punctuation">,</span> <span class="token string">&quot;Receiver&quot;</span><span class="token punctuation">,</span> <span class="token number">1000</span><span class="token punctuation">,</span> <span class="token constant">NULL</span><span class="token punctuation">,</span> <span class="token number">2</span><span class="token punctuation">,</span> <span class="token constant">NULL</span> <span class="token punctuation">)</span><span class="token punctuation">;</span>

		<span class="token comment">/* 启动调度器 */</span>
		<span class="token function">vTaskStartScheduler</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
	<span class="token punctuation">}</span>
	<span class="token keyword">else</span>
	<span class="token punctuation">{</span>
		<span class="token comment">/* 无法创建队列 */</span>
	<span class="token punctuation">}</span>

	<span class="token comment">/* 如果程序运行到了这里就表示出错了, 一般是内存不足 */</span>
	<span class="token keyword">return</span> <span class="token number">0</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>发送任务的函数中，不断往队列中写入数值，代码如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token keyword">static</span> <span class="token keyword">void</span> <span class="token function">vSenderTask</span><span class="token punctuation">(</span> <span class="token keyword">void</span> <span class="token operator">*</span>pvParameters <span class="token punctuation">)</span>
<span class="token punctuation">{</span>
	<span class="token class-name">int32_t</span> lValueToSend<span class="token punctuation">;</span>
	BaseType_t xStatus<span class="token punctuation">;</span>

	<span class="token comment">/* 我们会使用这个函数创建2个任务
	 * 这些任务的pvParameters不一样
 	 */</span>
	lValueToSend <span class="token operator">=</span> <span class="token punctuation">(</span> <span class="token class-name">int32_t</span> <span class="token punctuation">)</span> pvParameters<span class="token punctuation">;</span>

	<span class="token comment">/* 无限循环 */</span>
	<span class="token keyword">for</span><span class="token punctuation">(</span> <span class="token punctuation">;</span><span class="token punctuation">;</span> <span class="token punctuation">)</span>
	<span class="token punctuation">{</span>
		<span class="token comment">/* 写队列
		 * xQueue: 写哪个队列
		 * &amp;lValueToSend: 写什么数据? 传入数据的地址, 会从这个地址把数据复制进队列
		 * 0: 不阻塞, 如果队列满的话, 写入失败, 立刻返回
		 */</span>
		xStatus <span class="token operator">=</span> <span class="token function">xQueueSendToBack</span><span class="token punctuation">(</span> xQueue<span class="token punctuation">,</span> <span class="token operator">&amp;</span>lValueToSend<span class="token punctuation">,</span> <span class="token number">0</span> <span class="token punctuation">)</span><span class="token punctuation">;</span>

		<span class="token keyword">if</span><span class="token punctuation">(</span> xStatus <span class="token operator">!=</span> pdPASS <span class="token punctuation">)</span>
		<span class="token punctuation">{</span>
			<span class="token function">printf</span><span class="token punctuation">(</span> <span class="token string">&quot;Could not send to the queue.\\r\\n&quot;</span> <span class="token punctuation">)</span><span class="token punctuation">;</span>
		<span class="token punctuation">}</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>接收任务的函数中，读取队列、判断返回值、打印，代码如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token keyword">static</span> <span class="token keyword">void</span> <span class="token function">vReceiverTask</span><span class="token punctuation">(</span> <span class="token keyword">void</span> <span class="token operator">*</span>pvParameters <span class="token punctuation">)</span>
<span class="token punctuation">{</span>
	<span class="token comment">/* 读取队列时, 用这个变量来存放数据 */</span>
	<span class="token class-name">int32_t</span> lReceivedValue<span class="token punctuation">;</span>
	BaseType_t xStatus<span class="token punctuation">;</span>
	<span class="token keyword">const</span> TickType_t xTicksToWait <span class="token operator">=</span> <span class="token function">pdMS_TO_TICKS</span><span class="token punctuation">(</span> <span class="token number">100UL</span> <span class="token punctuation">)</span><span class="token punctuation">;</span>

	<span class="token comment">/* 无限循环 */</span>
	<span class="token keyword">for</span><span class="token punctuation">(</span> <span class="token punctuation">;</span><span class="token punctuation">;</span> <span class="token punctuation">)</span>
	<span class="token punctuation">{</span>
		<span class="token comment">/* 读队列
		 * xQueue: 读哪个队列
		 * &amp;lReceivedValue: 读到的数据复制到这个地址
		 * xTicksToWait: 如果队列为空, 阻塞一会
		 */</span>
		xStatus <span class="token operator">=</span> <span class="token function">xQueueReceive</span><span class="token punctuation">(</span> xQueue<span class="token punctuation">,</span> <span class="token operator">&amp;</span>lReceivedValue<span class="token punctuation">,</span> xTicksToWait <span class="token punctuation">)</span><span class="token punctuation">;</span>

		<span class="token keyword">if</span><span class="token punctuation">(</span> xStatus <span class="token operator">==</span> pdPASS <span class="token punctuation">)</span>
		<span class="token punctuation">{</span>
			<span class="token comment">/* 读到了数据 */</span>
			<span class="token function">printf</span><span class="token punctuation">(</span> <span class="token string">&quot;Received = %d\\r\\n&quot;</span><span class="token punctuation">,</span> lReceivedValue <span class="token punctuation">)</span><span class="token punctuation">;</span>
		<span class="token punctuation">}</span>
		<span class="token keyword">else</span>
		<span class="token punctuation">{</span>
			<span class="token comment">/* 没读到数据 */</span>
			<span class="token function">printf</span><span class="token punctuation">(</span> <span class="token string">&quot;Could not receive from the queue.\\r\\n&quot;</span> <span class="token punctuation">)</span><span class="token punctuation">;</span>
		<span class="token punctuation">}</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>程序运行结果如下：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/simulator/chapter-5/04_queue_read_example.png" alt="image-20210803145100540"></p><p>任务调度情况如下图所示：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/simulator/chapter-5/05_queue_read_schedule.png" alt="image-20210803150702562"></p><h2 id="_5-4-示例9-分辨数据源" tabindex="-1"><a class="header-anchor" href="#_5-4-示例9-分辨数据源" aria-hidden="true">#</a> 5.4 示例9: 分辨数据源</h2><p>本节代码为：<code>FreeRTOS_09_queue_datasource</code>。</p><p>当有多个发送任务，通过同一个队列发出数据，接收任务如何分辨数据来源？数据本身带有&quot;来源&quot;信息，比如写入队列的数据是一个结构体，结构体中的lDataSouceID用来表示数据来源：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token punctuation">{</span>
    ID_t eDataID<span class="token punctuation">;</span>
    <span class="token class-name">int32_t</span> lDataValue<span class="token punctuation">;</span>
<span class="token punctuation">}</span>Data_t<span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>不同的发送任务，先构造好结构体，填入自己的<code>eDataID</code>，再写队列；接收任务读出数据后，根据<code>eDataID</code>就可以知道数据来源了，如下图所示：</p><ul><li>CAN任务发送的数据：eDataID=eMotorSpeed</li><li>HMI任务发送的数据：eDataID=eSpeedSetPoint</li></ul><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/simulator/chapter-5/06_data_contain_source.png" alt="image-20210803163949972"></p><p><code>FreeRTOS_09_queue_datasource</code>程序会创建一个队列，然后创建2个发送任务、1个接收任务：</p><ul><li>创建的队列，用来发送结构体：数据大小是结构体的大小</li><li>发送任务优先级为2，分别往队列中写入自己的结构体，结构体中会标明数据来源</li><li>接收任务优先级为1，读队列、根据数据来源打印信息</li></ul><p>main函数中创建了队列、创建了发送任务、接收任务，代码如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* 定义2种数据来源(ID) */</span>
<span class="token keyword">typedef</span> <span class="token keyword">enum</span>
<span class="token punctuation">{</span>
	eMotorSpeed<span class="token punctuation">,</span>
	eSpeedSetPoint
<span class="token punctuation">}</span> ID_t<span class="token punctuation">;</span>

<span class="token comment">/* 定义在队列中传输的数据的格式 */</span>
<span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token punctuation">{</span>
    ID_t eDataID<span class="token punctuation">;</span>
    <span class="token class-name">int32_t</span> lDataValue<span class="token punctuation">;</span>
<span class="token punctuation">}</span>Data_t<span class="token punctuation">;</span>

<span class="token comment">/* 定义2个结构体 */</span>
<span class="token keyword">static</span> <span class="token keyword">const</span> Data_t xStructsToSend<span class="token punctuation">[</span> <span class="token number">2</span> <span class="token punctuation">]</span> <span class="token operator">=</span>
<span class="token punctuation">{</span>
	<span class="token punctuation">{</span> eMotorSpeed<span class="token punctuation">,</span>    <span class="token number">10</span> <span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token comment">/* CAN任务发送的数据 */</span>
	<span class="token punctuation">{</span> eSpeedSetPoint<span class="token punctuation">,</span> <span class="token number">5</span> <span class="token punctuation">}</span>   <span class="token comment">/* HMI任务发送的数据 */</span>
<span class="token punctuation">}</span><span class="token punctuation">;</span>

<span class="token comment">/* vSenderTask被用来创建2个任务，用于写队列
 * vReceiverTask被用来创建1个任务，用于读队列
 */</span>
<span class="token keyword">static</span> <span class="token keyword">void</span> <span class="token function">vSenderTask</span><span class="token punctuation">(</span> <span class="token keyword">void</span> <span class="token operator">*</span>pvParameters <span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token keyword">static</span> <span class="token keyword">void</span> <span class="token function">vReceiverTask</span><span class="token punctuation">(</span> <span class="token keyword">void</span> <span class="token operator">*</span>pvParameters <span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">/*-----------------------------------------------------------*/</span>

<span class="token comment">/* 队列句柄, 创建队列时会设置这个变量 */</span>
QueueHandle_t xQueue<span class="token punctuation">;</span>

<span class="token keyword">int</span> <span class="token function">main</span><span class="token punctuation">(</span> <span class="token keyword">void</span> <span class="token punctuation">)</span>
<span class="token punctuation">{</span>
	<span class="token function">prvSetupHardware</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
	
    <span class="token comment">/* 创建队列: 长度为5，数据大小为4字节(存放一个整数) */</span>
    xQueue <span class="token operator">=</span> <span class="token function">xQueueCreate</span><span class="token punctuation">(</span> <span class="token number">5</span><span class="token punctuation">,</span> <span class="token keyword">sizeof</span><span class="token punctuation">(</span> Data_t <span class="token punctuation">)</span> <span class="token punctuation">)</span><span class="token punctuation">;</span>

	<span class="token keyword">if</span><span class="token punctuation">(</span> xQueue <span class="token operator">!=</span> <span class="token constant">NULL</span> <span class="token punctuation">)</span>
	<span class="token punctuation">{</span>
		<span class="token comment">/* 创建2个任务用于写队列, 传入的参数是不同的结构体地址
		 * 任务函数会连续执行，向队列发送结构体
		 * 优先级为2
		 */</span>
		<span class="token function">xTaskCreate</span><span class="token punctuation">(</span>vSenderTask<span class="token punctuation">,</span> <span class="token string">&quot;CAN Task&quot;</span><span class="token punctuation">,</span> <span class="token number">1000</span><span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span><span class="token punctuation">)</span> <span class="token operator">&amp;</span><span class="token punctuation">(</span>xStructsToSend<span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token number">2</span><span class="token punctuation">,</span> <span class="token constant">NULL</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
		<span class="token function">xTaskCreate</span><span class="token punctuation">(</span>vSenderTask<span class="token punctuation">,</span> <span class="token string">&quot;HMI Task&quot;</span><span class="token punctuation">,</span> <span class="token number">1000</span><span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span><span class="token punctuation">)</span> <span class="token operator">&amp;</span><span class="token punctuation">(</span> xStructsToSend<span class="token punctuation">[</span><span class="token number">1</span><span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token number">2</span><span class="token punctuation">,</span> <span class="token constant">NULL</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

		<span class="token comment">/* 创建1个任务用于读队列
		 * 优先级为1, 低于上面的两个任务
		 * 这意味着发送任务优先写队列，队列常常是满的状态
		 */</span>
		<span class="token function">xTaskCreate</span><span class="token punctuation">(</span> vReceiverTask<span class="token punctuation">,</span> <span class="token string">&quot;Receiver&quot;</span><span class="token punctuation">,</span> <span class="token number">1000</span><span class="token punctuation">,</span> <span class="token constant">NULL</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">,</span> <span class="token constant">NULL</span> <span class="token punctuation">)</span><span class="token punctuation">;</span>

		<span class="token comment">/* 启动调度器 */</span>
		<span class="token function">vTaskStartScheduler</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
	<span class="token punctuation">}</span>
	<span class="token keyword">else</span>
	<span class="token punctuation">{</span>
		<span class="token comment">/* 无法创建队列 */</span>
	<span class="token punctuation">}</span>

	<span class="token comment">/* 如果程序运行到了这里就表示出错了, 一般是内存不足 */</span>
	<span class="token keyword">return</span> <span class="token number">0</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>发送任务的函数中，不断往队列中写入数值，代码如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token keyword">static</span> <span class="token keyword">void</span> <span class="token function">vSenderTask</span><span class="token punctuation">(</span> <span class="token keyword">void</span> <span class="token operator">*</span>pvParameters <span class="token punctuation">)</span>
<span class="token punctuation">{</span>
	BaseType_t xStatus<span class="token punctuation">;</span>
	<span class="token keyword">const</span> TickType_t xTicksToWait <span class="token operator">=</span> <span class="token function">pdMS_TO_TICKS</span><span class="token punctuation">(</span> <span class="token number">100UL</span> <span class="token punctuation">)</span><span class="token punctuation">;</span>

	<span class="token comment">/* 无限循环 */</span>
	<span class="token keyword">for</span><span class="token punctuation">(</span> <span class="token punctuation">;</span><span class="token punctuation">;</span> <span class="token punctuation">)</span>
	<span class="token punctuation">{</span>
		<span class="token comment">/* 写队列
		 * xQueue: 写哪个队列
		 * pvParameters: 写什么数据? 传入数据的地址, 会从这个地址把数据复制进队列
		 * xTicksToWait: 如果队列满的话, 阻塞一会
		 */</span>
		xStatus <span class="token operator">=</span> <span class="token function">xQueueSendToBack</span><span class="token punctuation">(</span> xQueue<span class="token punctuation">,</span> pvParameters<span class="token punctuation">,</span> xTicksToWait <span class="token punctuation">)</span><span class="token punctuation">;</span>

		<span class="token keyword">if</span><span class="token punctuation">(</span> xStatus <span class="token operator">!=</span> pdPASS <span class="token punctuation">)</span>
		<span class="token punctuation">{</span>
			<span class="token function">printf</span><span class="token punctuation">(</span> <span class="token string">&quot;Could not send to the queue.\\r\\n&quot;</span> <span class="token punctuation">)</span><span class="token punctuation">;</span>
		<span class="token punctuation">}</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>接收任务的函数中，读取队列、判断返回值、打印，代码如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token keyword">static</span> <span class="token keyword">void</span> <span class="token function">vReceiverTask</span><span class="token punctuation">(</span> <span class="token keyword">void</span> <span class="token operator">*</span>pvParameters <span class="token punctuation">)</span>
<span class="token punctuation">{</span>
	<span class="token comment">/* 读取队列时, 用这个变量来存放数据 */</span>
	Data_t xReceivedStructure<span class="token punctuation">;</span>
	BaseType_t xStatus<span class="token punctuation">;</span>

	<span class="token comment">/* 无限循环 */</span>
	<span class="token keyword">for</span><span class="token punctuation">(</span> <span class="token punctuation">;</span><span class="token punctuation">;</span> <span class="token punctuation">)</span>
	<span class="token punctuation">{</span>
		<span class="token comment">/* 读队列
		 * xQueue: 读哪个队列
		 * &amp;xReceivedStructure: 读到的数据复制到这个地址
		 * 0: 没有数据就即刻返回，不阻塞
		 */</span>
		xStatus <span class="token operator">=</span> <span class="token function">xQueueReceive</span><span class="token punctuation">(</span> xQueue<span class="token punctuation">,</span> <span class="token operator">&amp;</span>xReceivedStructure<span class="token punctuation">,</span> <span class="token number">0</span> <span class="token punctuation">)</span><span class="token punctuation">;</span>

		<span class="token keyword">if</span><span class="token punctuation">(</span> xStatus <span class="token operator">==</span> pdPASS <span class="token punctuation">)</span>
		<span class="token punctuation">{</span>
			<span class="token comment">/* 读到了数据 */</span>
			<span class="token keyword">if</span><span class="token punctuation">(</span> xReceivedStructure<span class="token punctuation">.</span>eDataID <span class="token operator">==</span> eMotorSpeed <span class="token punctuation">)</span>
			<span class="token punctuation">{</span>
				<span class="token function">printf</span><span class="token punctuation">(</span> <span class="token string">&quot;From CAN, MotorSpeed = %d\\r\\n&quot;</span><span class="token punctuation">,</span> xReceivedStructure<span class="token punctuation">.</span>lDataValue <span class="token punctuation">)</span><span class="token punctuation">;</span>
			<span class="token punctuation">}</span>
			<span class="token keyword">else</span> <span class="token keyword">if</span><span class="token punctuation">(</span> xReceivedStructure<span class="token punctuation">.</span>eDataID <span class="token operator">==</span> eSpeedSetPoint <span class="token punctuation">)</span>
			<span class="token punctuation">{</span>
				<span class="token function">printf</span><span class="token punctuation">(</span> <span class="token string">&quot;From HMI, SpeedSetPoint = %d\\r\\n&quot;</span><span class="token punctuation">,</span> xReceivedStructure<span class="token punctuation">.</span>lDataValue <span class="token punctuation">)</span><span class="token punctuation">;</span>
			<span class="token punctuation">}</span>
		<span class="token punctuation">}</span>
		<span class="token keyword">else</span>
		<span class="token punctuation">{</span>
			<span class="token comment">/* 没读到数据 */</span>
			<span class="token function">printf</span><span class="token punctuation">(</span> <span class="token string">&quot;Could not receive from the queue.\\r\\n&quot;</span> <span class="token punctuation">)</span><span class="token punctuation">;</span>
		<span class="token punctuation">}</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>运行结果如下：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/simulator/chapter-5/07_queue_data_with_struct.png" alt="image-20210803170521040"></p><p>任务调度情况如下图所示：</p><ul><li>t1：HMI是最后创建的最高优先级任务，它先执行，一下子向队列写入5个数据，把队列都写满了</li><li>t2：队列已经满了，HMI任务再发起第6次写操作时，进入阻塞状态。这时CAN任务是最高优先级的就绪态任务，它开始执行</li><li>t3：CAN任务发现队列已经满了，进入阻塞状态；接收任务变为最高优先级的就绪态任务，它开始运行</li><li>t4：现在，HMI任务、CAN任务的优先级都比接收任务高，它们都在等待队列有空闲的空间；一旦接收任务读出1个数据，会马上被抢占。被谁抢占？谁等待最久？HMI任务！所以在t4时刻，切换到HMI任务。</li><li>t5：HMI任务向队列写入第6个数据，然后再次阻塞，这是CAN任务已经阻塞很久了。接收任务变为最高优先级的就绪态任务，开始执行。</li><li>t6：现在，HMI任务、CAN任务的优先级都比接收任务高，它们都在等待队列有空闲的空间；一旦接收任务读出1个数据，会马上被抢占。被谁抢占？谁等待最久？CAN任务！所以在t6时刻，切换到CAN任务。</li><li>t7：CAN任务向队列写入数据，因为仅仅有一个空间供写入，所以它马上再次进入阻塞状态。这时HMI任务、CAN任务都在等待空闲空间，只有接收任务可以继续执行。</li></ul><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/simulator/chapter-5/08_queue_data_with_struct_schedule.png" alt="image-20210803170859100"></p><h2 id="_5-5-示例10-传输大块数据" tabindex="-1"><a class="header-anchor" href="#_5-5-示例10-传输大块数据" aria-hidden="true">#</a> 5.5 示例10: 传输大块数据</h2><p>本节代码为：<code>FreeRTOS_10_queue_bigtransfer</code>。</p><p>FreeRTOS的队列使用拷贝传输，也就是要传输uint32_t时，把4字节的数据拷贝进队列；要传输一个8字节的结构体时，把8字节的数据拷贝进队列。</p><p>如果要传输1000字节的结构体呢？写队列时拷贝1000字节，读队列时再拷贝1000字节？不建议这么做，影响效率！</p><p>这时候，我们要传输的是这个巨大结构体的地址：把它的地址写入队列，对方从队列得到这个地址，使用地址去访问那1000字节的数据。</p><p>使用地址来间接传输数据时，这些数据放在RAM里，对于这块RAM，要保证这几点：</p><ul><li>RAM的所有者、操作者，必须清晰明了 这块内存，就被称为&quot;共享内存&quot;。要确保不能同时修改RAM。比如，在写队列之前只有由发送者修改这块RAM，在读队列之后只能由接收者访问这块RAM。</li><li>RAM要保持可用 这块RAM应该是全局变量，或者是动态分配的内存。对于动然分配的内存，要确保它不能提前释放：要等到接收者用完后再释放。另外，不能是局部变量。</li></ul><p><code>FreeRTOS_10_queue_bigtransfer</code>程序会创建一个队列，然后创建1个发送任务、1个接收任务：</p><ul><li>创建的队列：长度为1，用来传输&quot;char *&quot;指针</li><li>发送任务优先级为1，在字符数组中写好数据后，把它的地址写入队列</li><li>接收任务优先级为2，读队列得到&quot;char *&quot;值，把它打印出来</li></ul><p>这个程序故意设置接收任务的优先级更高，在它访问数组的过程中，接收任务无法执行、无法写这个数组。</p><p>main函数中创建了队列、创建了发送任务、接收任务，代码如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* 定义一个字符数组 */</span>
<span class="token keyword">static</span> <span class="token keyword">char</span> pcBuffer<span class="token punctuation">[</span><span class="token number">100</span><span class="token punctuation">]</span><span class="token punctuation">;</span>


<span class="token comment">/* vSenderTask被用来创建2个任务，用于写队列
 * vReceiverTask被用来创建1个任务，用于读队列
 */</span>
<span class="token keyword">static</span> <span class="token keyword">void</span> <span class="token function">vSenderTask</span><span class="token punctuation">(</span> <span class="token keyword">void</span> <span class="token operator">*</span>pvParameters <span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token keyword">static</span> <span class="token keyword">void</span> <span class="token function">vReceiverTask</span><span class="token punctuation">(</span> <span class="token keyword">void</span> <span class="token operator">*</span>pvParameters <span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">/*-----------------------------------------------------------*/</span>

<span class="token comment">/* 队列句柄, 创建队列时会设置这个变量 */</span>
QueueHandle_t xQueue<span class="token punctuation">;</span>

<span class="token keyword">int</span> <span class="token function">main</span><span class="token punctuation">(</span> <span class="token keyword">void</span> <span class="token punctuation">)</span>
<span class="token punctuation">{</span>
	<span class="token function">prvSetupHardware</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
	
    <span class="token comment">/* 创建队列: 长度为1，数据大小为4字节(存放一个char指针) */</span>
    xQueue <span class="token operator">=</span> <span class="token function">xQueueCreate</span><span class="token punctuation">(</span> <span class="token number">1</span><span class="token punctuation">,</span> <span class="token keyword">sizeof</span><span class="token punctuation">(</span><span class="token keyword">char</span> <span class="token operator">*</span><span class="token punctuation">)</span> <span class="token punctuation">)</span><span class="token punctuation">;</span>

	<span class="token keyword">if</span><span class="token punctuation">(</span> xQueue <span class="token operator">!=</span> <span class="token constant">NULL</span> <span class="token punctuation">)</span>
	<span class="token punctuation">{</span>
		<span class="token comment">/* 创建1个任务用于写队列
		 * 任务函数会连续执行，构造buffer数据，把buffer地址写入队列
		 * 优先级为1
		 */</span>
		<span class="token function">xTaskCreate</span><span class="token punctuation">(</span> vSenderTask<span class="token punctuation">,</span> <span class="token string">&quot;Sender&quot;</span><span class="token punctuation">,</span> <span class="token number">1000</span><span class="token punctuation">,</span> <span class="token constant">NULL</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">,</span> <span class="token constant">NULL</span> <span class="token punctuation">)</span><span class="token punctuation">;</span>

		<span class="token comment">/* 创建1个任务用于读队列
		 * 优先级为2, 高于上面的两个任务
		 * 这意味着读队列得到buffer地址后，本任务使用buffer时不会被打断
		 */</span>
		<span class="token function">xTaskCreate</span><span class="token punctuation">(</span> vReceiverTask<span class="token punctuation">,</span> <span class="token string">&quot;Receiver&quot;</span><span class="token punctuation">,</span> <span class="token number">1000</span><span class="token punctuation">,</span> <span class="token constant">NULL</span><span class="token punctuation">,</span> <span class="token number">2</span><span class="token punctuation">,</span> <span class="token constant">NULL</span> <span class="token punctuation">)</span><span class="token punctuation">;</span>

		<span class="token comment">/* 启动调度器 */</span>
		<span class="token function">vTaskStartScheduler</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
	<span class="token punctuation">}</span>
	<span class="token keyword">else</span>
	<span class="token punctuation">{</span>
		<span class="token comment">/* 无法创建队列 */</span>
	<span class="token punctuation">}</span>

	<span class="token comment">/* 如果程序运行到了这里就表示出错了, 一般是内存不足 */</span>
	<span class="token keyword">return</span> <span class="token number">0</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>发送任务的函数中，现在全局大数组pcBuffer中构造数据，然后把它的地址写入队列，代码如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token keyword">static</span> <span class="token keyword">void</span> <span class="token function">vSenderTask</span><span class="token punctuation">(</span> <span class="token keyword">void</span> <span class="token operator">*</span>pvParameters <span class="token punctuation">)</span>
<span class="token punctuation">{</span>
	BaseType_t xStatus<span class="token punctuation">;</span>
	<span class="token keyword">static</span> <span class="token keyword">int</span> cnt <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>
	
	<span class="token keyword">char</span> <span class="token operator">*</span>buffer<span class="token punctuation">;</span>

	<span class="token comment">/* 无限循环 */</span>
	<span class="token keyword">for</span><span class="token punctuation">(</span> <span class="token punctuation">;</span><span class="token punctuation">;</span> <span class="token punctuation">)</span>
	<span class="token punctuation">{</span>
		<span class="token function">sprintf</span><span class="token punctuation">(</span>pcBuffer<span class="token punctuation">,</span> <span class="token string">&quot;www.100ask.net Msg %d\\r\\n&quot;</span><span class="token punctuation">,</span> cnt<span class="token operator">++</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
		buffer <span class="token operator">=</span> pcBuffer<span class="token punctuation">;</span> <span class="token comment">// buffer变量等于数组的地址, 下面要把这个地址写入队列</span>
		
		<span class="token comment">/* 写队列
		 * xQueue: 写哪个队列
		 * pvParameters: 写什么数据? 传入数据的地址, 会从这个地址把数据复制进队列
		 * 0: 如果队列满的话, 即刻返回
		 */</span>
		xStatus <span class="token operator">=</span> <span class="token function">xQueueSendToBack</span><span class="token punctuation">(</span> xQueue<span class="token punctuation">,</span> <span class="token operator">&amp;</span>buffer<span class="token punctuation">,</span> <span class="token number">0</span> <span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">/* 只需要写入4字节, 无需写入整个buffer */</span>

		<span class="token keyword">if</span><span class="token punctuation">(</span> xStatus <span class="token operator">!=</span> pdPASS <span class="token punctuation">)</span>
		<span class="token punctuation">{</span>
			<span class="token function">printf</span><span class="token punctuation">(</span> <span class="token string">&quot;Could not send to the queue.\\r\\n&quot;</span> <span class="token punctuation">)</span><span class="token punctuation">;</span>
		<span class="token punctuation">}</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>接收任务的函数中，读取队列、得到buffer的地址、打印，代码如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token keyword">static</span> <span class="token keyword">void</span> <span class="token function">vReceiverTask</span><span class="token punctuation">(</span> <span class="token keyword">void</span> <span class="token operator">*</span>pvParameters <span class="token punctuation">)</span>
<span class="token punctuation">{</span>
	<span class="token comment">/* 读取队列时, 用这个变量来存放数据 */</span>
	<span class="token keyword">char</span> <span class="token operator">*</span>buffer<span class="token punctuation">;</span>
	<span class="token keyword">const</span> TickType_t xTicksToWait <span class="token operator">=</span> <span class="token function">pdMS_TO_TICKS</span><span class="token punctuation">(</span> <span class="token number">100UL</span> <span class="token punctuation">)</span><span class="token punctuation">;</span>	
	BaseType_t xStatus<span class="token punctuation">;</span>

	<span class="token comment">/* 无限循环 */</span>
	<span class="token keyword">for</span><span class="token punctuation">(</span> <span class="token punctuation">;</span><span class="token punctuation">;</span> <span class="token punctuation">)</span>
	<span class="token punctuation">{</span>
		<span class="token comment">/* 读队列
		 * xQueue: 读哪个队列
		 * &amp;xReceivedStructure: 读到的数据复制到这个地址
		 * xTicksToWait: 没有数据就阻塞一会
		 */</span>
		xStatus <span class="token operator">=</span> <span class="token function">xQueueReceive</span><span class="token punctuation">(</span> xQueue<span class="token punctuation">,</span> <span class="token operator">&amp;</span>buffer<span class="token punctuation">,</span> xTicksToWait<span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">/* 得到buffer地址，只是4字节 */</span>

		<span class="token keyword">if</span><span class="token punctuation">(</span> xStatus <span class="token operator">==</span> pdPASS <span class="token punctuation">)</span>
		<span class="token punctuation">{</span>
			<span class="token comment">/* 读到了数据 */</span>
			<span class="token function">printf</span><span class="token punctuation">(</span><span class="token string">&quot;Get: %s&quot;</span><span class="token punctuation">,</span> buffer<span class="token punctuation">)</span><span class="token punctuation">;</span>
		<span class="token punctuation">}</span>
		<span class="token keyword">else</span>
		<span class="token punctuation">{</span>
			<span class="token comment">/* 没读到数据 */</span>
			<span class="token function">printf</span><span class="token punctuation">(</span> <span class="token string">&quot;Could not receive from the queue.\\r\\n&quot;</span> <span class="token punctuation">)</span><span class="token punctuation">;</span>
		<span class="token punctuation">}</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>运行结果如下图所示：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/simulator/chapter-5/09_queue_transfer_big_data.png" alt="image-20210803181502048"></p><h2 id="_5-6-示例11-邮箱-mailbox" tabindex="-1"><a class="header-anchor" href="#_5-6-示例11-邮箱-mailbox" aria-hidden="true">#</a> 5.6 示例11: 邮箱(Mailbox)</h2><p>本节代码为：<code>FreeRTOS_11_queue_mailbox</code>。</p><p>FreeRTOS的邮箱概念跟别的RTOS不一样，这里的邮箱称为&quot;橱窗&quot;也许更恰当：</p><ul><li>它是一个队列，队列长度只有1</li><li>写邮箱：新数据覆盖旧数据，在任务中使用<code>xQueueOverwrite()</code>，在中断中使用<code>xQueueOverwriteFromISR()</code>。 既然是覆盖，那么无论邮箱中是否有数据，这些函数总能成功写入数据。</li><li>读邮箱：读数据时，数据不会被移除；在任务中使用<code>xQueuePeek()</code>，在中断中使用<code>xQueuePeekFromISR()</code>。 这意味着，第一次调用时会因为无数据而阻塞，一旦曾经写入数据，以后读邮箱时总能成功。</li></ul><p>main函数中创建了队列(队列长度为1)、创建了发送任务、接收任务：</p><ul><li>发送任务的优先级为2，它先执行</li><li>接收任务的优先级为1</li></ul><p>代码如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* 队列句柄, 创建队列时会设置这个变量 */</span>
QueueHandle_t xQueue<span class="token punctuation">;</span>

<span class="token keyword">int</span> <span class="token function">main</span><span class="token punctuation">(</span> <span class="token keyword">void</span> <span class="token punctuation">)</span>
<span class="token punctuation">{</span>
	<span class="token function">prvSetupHardware</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
	
    <span class="token comment">/* 创建队列: 长度为1，数据大小为4字节(存放一个char指针) */</span>
    xQueue <span class="token operator">=</span> <span class="token function">xQueueCreate</span><span class="token punctuation">(</span> <span class="token number">1</span><span class="token punctuation">,</span> <span class="token keyword">sizeof</span><span class="token punctuation">(</span><span class="token class-name">uint32_t</span><span class="token punctuation">)</span> <span class="token punctuation">)</span><span class="token punctuation">;</span>

	<span class="token keyword">if</span><span class="token punctuation">(</span> xQueue <span class="token operator">!=</span> <span class="token constant">NULL</span> <span class="token punctuation">)</span>
	<span class="token punctuation">{</span>
		<span class="token comment">/* 创建1个任务用于写队列
		 * 任务函数会连续执行，构造buffer数据，把buffer地址写入队列
		 * 优先级为2
		 */</span>
		<span class="token function">xTaskCreate</span><span class="token punctuation">(</span> vSenderTask<span class="token punctuation">,</span> <span class="token string">&quot;Sender&quot;</span><span class="token punctuation">,</span> <span class="token number">1000</span><span class="token punctuation">,</span> <span class="token constant">NULL</span><span class="token punctuation">,</span> <span class="token number">2</span><span class="token punctuation">,</span> <span class="token constant">NULL</span> <span class="token punctuation">)</span><span class="token punctuation">;</span>

		<span class="token comment">/* 创建1个任务用于读队列
		 * 优先级为1
		 */</span>
		<span class="token function">xTaskCreate</span><span class="token punctuation">(</span> vReceiverTask<span class="token punctuation">,</span> <span class="token string">&quot;Receiver&quot;</span><span class="token punctuation">,</span> <span class="token number">1000</span><span class="token punctuation">,</span> <span class="token constant">NULL</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">,</span> <span class="token constant">NULL</span> <span class="token punctuation">)</span><span class="token punctuation">;</span>

		<span class="token comment">/* 启动调度器 */</span>
		<span class="token function">vTaskStartScheduler</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
	<span class="token punctuation">}</span>
	<span class="token keyword">else</span>
	<span class="token punctuation">{</span>
		<span class="token comment">/* 无法创建队列 */</span>
	<span class="token punctuation">}</span>

	<span class="token comment">/* 如果程序运行到了这里就表示出错了, 一般是内存不足 */</span>
	<span class="token keyword">return</span> <span class="token number">0</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>发送任务、接收任务的代码和执行流程如下：</p><ul><li>A：发送任务先执行，马上阻塞</li><li>BC：接收任务执行，这是邮箱无数据，打印&quot;Could not ...&quot;。在发送任务阻塞过程中，接收任务多次执行、多次打印。</li><li>D：发送任务从阻塞状态退出，立刻执行、写队列</li><li>E：发送任务再次阻塞</li><li>FG、HI、……：接收任务不断&quot;偷看&quot;邮箱，得到同一个数据，打印出多个&quot;Get: 0&quot;</li><li>J：发送任务从阻塞状态退出，立刻执行、覆盖队列，写入1</li><li>K：发送任务再次阻塞</li><li>LM、……：接收任务不断&quot;偷看&quot;邮箱，得到同一个数据，打印出多个&quot;Get: 1&quot;</li></ul><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/simulator/chapter-5/11_queue_mailbox_code.png" alt="image-20210803191526300"></p><p>运行结果如下图所示：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/simulator/chapter-5/10_queue_mailbox_result.png" alt="image-20210803190540351"></p><h2 id="技术答疑交流" tabindex="-1"><a class="header-anchor" href="#技术答疑交流" aria-hidden="true">#</a> 技术答疑交流</h2>`,129),k={href:"https://forums.100ask.net",target:"_blank",rel:"noopener noreferrer"},v=s("hr",null,null,-1);function m(b,h){const t=a("ExternalLinkIcon"),p=a("center");return c(),o("div",null,[r,s("p",null,[n("在学习中遇到任何问题，请前往我们的技术交流社区留言： "),s("a",k,[n("https://forums.100ask.net"),e(t)])]),v,e(p,null,{default:l(()=>[n("本章完")]),_:1})])}const x=i(d,[["render",m],["__file","chapter5.html.vue"]]);export{x as default};
