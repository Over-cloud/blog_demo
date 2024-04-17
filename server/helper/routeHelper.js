function getRouteClass(target, curr) {
    return target === curr ? 'active' : ''
}

module.exports = getRouteClass
