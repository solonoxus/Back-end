const Contact = require('../models/contactModel');

const contactController = {
  // Tạo liên hệ mới
  async createContact(req, reply) {
    try {
      const contact = new Contact({
        ...req.body,
        user: req.user ? req.user._id : null
      });

      await contact.save();
      return reply.code(201).send(contact);
    } catch (error) {
      console.error('Error creating contact:', error);
      return reply.status(500).send({ message: 'Lỗi khi gửi liên hệ' });
    }
  },

  // Admin: Lấy danh sách liên hệ
  async getContacts(req, reply) {
    try {
      const { status, sort = 'createdAt', page = 1, limit = 10 } = req.query;

      const query = {};
      if (status) query.status = status;

      const skip = (page - 1) * limit;
      const [contacts, total] = await Promise.all([
        Contact.find(query)
          .populate('user', 'name email')
          .sort({ [sort]: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Contact.countDocuments(query)
      ]);

      return reply.send({
        contacts,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error getting contacts:', error);
      return reply.status(500).send({ message: 'Lỗi khi lấy danh sách liên hệ' });
    }
  },

  // Admin: Cập nhật trạng thái liên hệ
  async updateContact(req, reply) {
    try {
      const contact = await Contact.findByIdAndUpdate(
        req.params.id,
        { status: req.body.status },
        { new: true }
      ).populate('user', 'name email');

      if (!contact) {
        return reply.status(404).send({ message: 'Không tìm thấy liên hệ' });
      }

      return reply.send(contact);
    } catch (error) {
      console.error('Error updating contact:', error);
      return reply.status(500).send({ message: 'Lỗi khi cập nhật liên hệ' });
    }
  },

  // Admin: Xóa liên hệ
  async deleteContact(req, reply) {
    try {
      const contact = await Contact.findByIdAndDelete(req.params.id);
      if (!contact) {
        return reply.status(404).send({ message: 'Không tìm thấy liên hệ' });
      }

      return reply.send({ message: 'Đã xóa liên hệ' });
    } catch (error) {
      console.error('Error deleting contact:', error);
      return reply.status(500).send({ message: 'Lỗi khi xóa liên hệ' });
    }
  }
};

module.exports = contactController;