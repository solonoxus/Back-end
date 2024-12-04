async function authMiddleware(request, reply) {
    try {
      const token = request.headers.authorization?.split(' ')[1]
      if (!token) {
        throw new Error('No token provided')
      }
      
      // Giả sử sử dụng JWT
      const decoded = jwt.verify(token, 'your_jwt_secret')
      request.user = decoded
      
    } catch (error) {
      reply.code(401).send({ error: 'Authentication failed' })
    }
  }
  
  async function validateUserInput(request, reply) {
    const { email, password } = request.body
    if (!email || !password) {
      reply.code(400).send({ error: 'Email and password are required' })
    }
  }
  
  module.exports = {
    authMiddleware,
    validateUserInput
  }
  