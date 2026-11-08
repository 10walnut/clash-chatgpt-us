// ClashMi JS 覆写：ChatGPT / OpenAI 固定使用美国节点
// 适用：ClashMi v1.0.21.702 及以上支持 JS 覆写的版本
// 导入后，将此覆写分配给需要处理的订阅配置。

function main(config) {
  const GROUP = '🤖 ChatGPT-US'
  const AUTO_GROUP = '🇺🇸 美国自动选择'

  if (!config || typeof config !== 'object') return config

  const proxies = Array.isArray(config.proxies) ? config.proxies : []
  const usNamePattern = /🇺🇸|美国|美國|United\s*States|(?:^|[| _-])US(?:$|[| _-])|(?:^|[| _-])USA(?:$|[| _-])/i
  const usNodes = Array.from(new Set(
    proxies
      .map(function (proxy) { return proxy && proxy.name })
      .filter(function (name) {
        return typeof name === 'string' && usNamePattern.test(name)
      })
  ))

  // 没有识别到美国节点时不改动原订阅，避免生成不可用策略组。
  if (usNodes.length === 0) return config

  const originalGroups = Array.isArray(config['proxy-groups'])
    ? config['proxy-groups']
    : []

  config['proxy-groups'] = originalGroups.filter(function (group) {
    return !group || (group.name !== GROUP && group.name !== AUTO_GROUP)
  })

  // 两个组都只包含美国节点，不提供 DIRECT 或其他国家回退。
  config['proxy-groups'].unshift(
    {
      name: AUTO_GROUP,
      type: 'url-test',
      proxies: usNodes,
      url: 'https://www.gstatic.com/generate_204',
      interval: 300,
      tolerance: 80,
      lazy: true
    },
    {
      name: GROUP,
      type: 'select',
      proxies: [AUTO_GROUP].concat(usNodes)
    }
  )

  // 让机场原有的主线路选择组也能选择 ChatGPT-US。
  // 追加在末尾，不改变机场原来的默认选择。
  const mainSelectorPattern = /节点选择|选择线路|代理选择|代理节点|线路选择|手动选择|手动切换/i
  config['proxy-groups'].forEach(function (group) {
    if (!group || group.name === GROUP || group.name === AUTO_GROUP) return
    if (group.type !== 'select' || !Array.isArray(group.proxies)) return
    if (!mainSelectorPattern.test(group.name)) return

    group.proxies = group.proxies
      .filter(function (name) { return name !== GROUP })
      .concat([GROUP])
  })

  const chatgptRules = [
    'DOMAIN-SUFFIX,chatgpt.com,' + GROUP,
    'DOMAIN-SUFFIX,openai.com,' + GROUP,
    'DOMAIN-SUFFIX,oaistatic.com,' + GROUP,
    'DOMAIN-SUFFIX,oaiusercontent.com,' + GROUP,
    'DOMAIN-SUFFIX,oaistatsig.com,' + GROUP,
    'DOMAIN-SUFFIX,openaimerge.com,' + GROUP,
    'DOMAIN-SUFFIX,ct.sendgrid.net,' + GROUP,
    'DOMAIN-SUFFIX,intercom.io,' + GROUP,
    'DOMAIN-SUFFIX,intercomcdn.com,' + GROUP,
    'DOMAIN,cdn.workos.com,' + GROUP,
    'DOMAIN,forwarder.workos.com,' + GROUP,
    'DOMAIN,images.workoscdn.com,' + GROUP,
    'DOMAIN,setup.workos.com,' + GROUP,
    'DOMAIN,workos.imgix.net,' + GROUP,
    'DOMAIN,challenges.cloudflare.com,' + GROUP,
    'DOMAIN,humb.apple.com,' + GROUP,
    'DOMAIN,js.stripe.com,' + GROUP,
    'DOMAIN,o207216.ingest.sentry.io,' + GROUP,
    'DOMAIN,o33249.ingest.sentry.io,' + GROUP,
    'DOMAIN,rum.browser-intake-datadoghq.com,' + GROUP
  ]

  const originalRules = Array.isArray(config.rules) ? config.rules : []
  const generatedDomains = new Set(chatgptRules.map(function (rule) {
    return rule.split(',').slice(0, 2).join(',')
  }))

  const cleanedRules = originalRules.filter(function (rule) {
    if (typeof rule !== 'string') return true
    return !generatedDomains.has(rule.split(',').slice(0, 2).join(','))
  })

  // 必须放在原规则前面，防止先被国外网站、广告或 MATCH 规则命中。
  config.rules = chatgptRules.concat(cleanedRules)
  return config
}

