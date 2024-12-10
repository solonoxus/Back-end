exports.getContact = async (req, reply) => {
    reply.view('lienhe', { title: 'Liên Hệ', message: 'Hãy liên hệ với chúng tôi qua biểu mẫu sau.' });
  };