import EmailTemplate from "../models/EmailTemplate.js";

export const createTemplate = async (req, res) => {
  const { name, subject, blocks } = req.body;

  const template = await EmailTemplate.create({
    name,
    subject,
    blocks,
    createdBy: req.adminId,
  });

  res.json(template);
};


export const getTemplates = async (req, res) => {
  try {
    const filter =
      req.role === "superadmin"
        ? {}
        : { createdBy: req.adminId };

    const templates = await EmailTemplate.find(filter)
      .sort({ createdAt: -1 });

    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTemplateById = async (req, res) => {
  try {
    const template = await EmailTemplate.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    res.json(template);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




